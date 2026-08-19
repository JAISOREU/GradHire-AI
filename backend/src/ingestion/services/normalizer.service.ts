import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AiService, NormalizedJobResponse } from '../../ai/ai.service';
import { RawJobItem } from '../adapters/source-adapter.interface';
import { Job, JobSource, JobSourceParserType } from '@prisma/client';
import { sanitizeDatabaseString } from '../../common/utils/sanitize';

export interface NormalizedJob {
  title: string;
  company: string;
  description: string;
  responsibilities?: string;
  type: Job['type'];
  workplaceType: Job['workplaceType'];
  experienceLevel?: Job['experienceLevel'];
  requiredSkills: string[];
  preferredSkills: string[];
  country?: string;
  city?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  applicationUrl: string;
  sourceUrl: string;
  requiredQualifications?: string;
  acceptsFreshGraduates?: boolean;
  acceptsStudents?: boolean;
  noExperienceRequired?: boolean;
  internshipAccepted?: boolean;
}

@Injectable()
export class NormalizerService {
  private readonly logger = new Logger(NormalizerService.name);

  constructor(private readonly prisma: PrismaService, private readonly ai: AiService) {}

  async normalize(source: JobSource, raw: RawJobItem): Promise<NormalizedJob> {
    const providerNormalized = this.providerNormalize(source.parserType ?? 'GENERIC', raw);
    let enriched = providerNormalized;

    if (this.ai && providerNormalized) {
      try {
        const enrichedData = await this.tryAiEnrichment(source, raw, providerNormalized);
        if (enrichedData) {
          enriched = enrichedData;
        }
      } catch {
        this.logger.warn(`AI enrichment failed for source ${source.id}, using provider normalization`);
      }
    }

    if (!enriched.applicationUrl) {
      enriched.applicationUrl = raw.applicationUrl;
    }
    if (!enriched.sourceUrl) {
      enriched.sourceUrl = raw.sourceUrl;
    }

    const cleanedDescription = this.cleanText(enriched.description);
    const formattedDescription = this.formatJobDescription(cleanedDescription, enriched);

    enriched.description = formattedDescription;
    enriched.requiredQualifications = this.cleanText(enriched.requiredQualifications);
    enriched.company = this.resolveCompany(enriched.company, source);

    return enriched;
  }

  private resolveCompany(company: string, source: JobSource): string {
    const trimmed = (company || '').trim();
    if (trimmed && trimmed !== 'Unknown' && trimmed.length > 1) {
      return trimmed;
    }

    const sourceCompany = (source as any).company as string | undefined;
    if (sourceCompany && sourceCompany.trim().length > 1) {
      return sourceCompany.trim();
    }

    const sourceName = (source.name || '').trim();
    if (sourceName.length > 1) {
      return sourceName;
    }

    return 'Not specified';
  }

  private cleanText(input: string | undefined | null): string {
    if (!input) return '';

    let text = input.replace(/\0/g, '');
    text = text.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/&nbsp;/gi, ' ');
    text = text.replace(/&lt;/gi, '<');
    text = text.replace(/&gt;/gi, '>');
    text = text.replace(/&amp;/gi, '&');
    text = text.replace(/&quot;/gi, '"');
    text = text.replace(/&#39;/gi, "'");
    text = text.replace(/&#x[0-9a-fA-F]+;|&#\d+;/gi, ' ');

    const boilerplatePatterns = [
      /cookie\s*(policy|notice|consent).*?$/gim,
      /privacy\s*policy.*?$/gim,
      /terms\s*(of\s*use|service).*?$/gim,
      /all\s*rights\s*reserved.*?$/gim,
      /powered\s*by.*?$/gim,
      /subscribe\s*to.*?$/gim,
      /follow\s*us\s*(on|at).*?$/gim,
      /share\s*this\s*job.*?$/gim,
      /back\s*to\s*(top|search).*?$/gim,
      /home\s*page\s*of.*?$/gim,
      /site\s*map.*?$/gim,
      /click\s*here\s*(to|for).*?$/gim,
      /read\s*more.*?$/gim,
      /view\s*all\s*jobs.*?$/gim,
      /browse\s*jobs.*?$/gim,
      /sign\s*in\s*or\s*register.*?$/gim,
      /login\s*(here|to|required).*?$/gim,
      /create\s*alert.*?$/gim,
      /save\s*(this\s*)?job.*?$/gim,
      /email\s*me\s*jobs.*?$/gim,
      /similar\s*jobs.*?$/gim,
      /related\s*jobs.*?$/gim,
      /you\s*may\s*also\s*be\s*interested.*?$/gim,
      /recommended\s*for\s*you.*?$/gim,
      /sponsored\s*listing.*?$/gim,
      /advertisement.*?$/gim,
      /google\s*(ads|analytics|tag\s*manager).*?$/gim,
      /facebook\s*pixel.*?$/gim,
      /linkedin\s*tracking.*?$/gim,
      /utm_\w+=[^&\s]+/gi,
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      /\[?https?:\/\/[^\s\]\)]+/gi,
      /\[?email\s*(protected|redacted)[^\s]*\]?/gi,
      /\[?phone\s*(number|protected|redacted)[^\s]*\]?/gi,
    ];

    for (const pattern of boilerplatePatterns) {
      text = text.replace(pattern, '');
    }

    const lines = text.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 0);
    const uniqueLines = lines.filter((line, index, self) => {
      const normalized = line.toLowerCase().replace(/\s+/g, ' ').trim();
      return index === self.findIndex((l) => l.toLowerCase().replace(/\s+/g, ' ').trim() === normalized);
    });

    text = uniqueLines.join('\n\n');

    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    const maxLength = 8000;
    if (text.length > maxLength) {
      text = text.slice(0, maxLength).trim() + '...';
    }

    return text;
  }

  private formatJobDescription(description: string, enriched: NormalizedJob): string {
    if (!description) return '';

    const responsibilities = enriched.responsibilities || description;
    const qualifications = this.cleanText(enriched.requiredQualifications);

    const parts: string[] = [];

    if (description) {
      parts.push(description);
    }

    if (responsibilities && responsibilities !== description) {
      parts.push(`Responsibilities\n${responsibilities}`);
    }

    if (qualifications) {
      parts.push(`Qualifications\n${qualifications}`);
    }

    return parts.join('\n\n');
  }

  private providerNormalize(parserType: JobSourceParserType, raw: RawJobItem): NormalizedJob {
    const typeMap: Record<string, Job['type']> = {
      fulltime: 'HIRING',
      full_time: 'HIRING',
      permanent: 'HIRING',
      internship: 'INTERNSHIP',
      apprenticeship: 'APPRENTICESHIP',
      contract: 'CONTRACT',
      temporary: 'TEMPORARY',
      freelance: 'FREELANCE',
      part_time: 'PART_TIME',
    };

    const typeRaw = (raw.type ?? 'HIRING').toLowerCase().replace(/[^a-z_]/g, '_');
    const type = typeMap[typeRaw] ?? 'HIRING';

    const workplaceRaw = (raw.workplaceType ?? 'ONSITE').toUpperCase();
    const workplaceType = ['REMOTE', 'HYBRID', 'ONSITE'].includes(workplaceRaw)
      ? (workplaceRaw as Job['workplaceType'])
      : 'ONSITE';

    const allSkills = raw.skills ?? [];
    const requiredSkills = allSkills.slice(0, Math.ceil(allSkills.length * 0.7));
    const preferredSkills = allSkills.slice(requiredSkills.length);

    const locationParts = raw.location ? raw.location.split(',').map((p) => p.trim()) : [];
    const city = locationParts[0] ?? '';
    const country = locationParts[locationParts.length - 1] ?? '';

    const salaryMin = raw.salaryMin ?? null;
    const salaryMax = raw.salaryMax ?? null;

    const currencyRaw = String(raw.currency ?? '');
    const currency = ['USD', 'EUR', 'GBP', 'PHP', 'SGD', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'].includes(currencyRaw.toUpperCase())
      ? currencyRaw.toUpperCase()
      : undefined;

    return {
      title: raw.title,
      company: raw.company,
      description: raw.description,
      responsibilities: raw.description,
      type,
      workplaceType,
      requiredSkills,
      preferredSkills,
      country: country || undefined,
      city: city || undefined,
      salaryMin,
      salaryMax,
      currency,
      applicationUrl: raw.applicationUrl,
      sourceUrl: raw.sourceUrl,
      requiredQualifications: raw.requiredQualifications || undefined,
      acceptsFreshGraduates: raw.acceptsFreshGraduates ?? undefined,
      acceptsStudents: raw.acceptsStudents ?? undefined,
      noExperienceRequired: raw.noExperienceRequired ?? undefined,
      internshipAccepted: raw.internshipAccepted ?? undefined,
    };
  }

  private async tryAiEnrichment(source: JobSource, raw: RawJobItem, base: NormalizedJob): Promise<NormalizedJob | null> {
    const prompt = [
      'You are a job data normalizer. Map the following raw job item into structured fields.',
      'Return JSON with: title, company, description, type (HIRING|INTERNSHIP|APPRENTICESHIP|CONTRACT|TEMPORARY|FREELANCE|PART_TIME),',
      'workplaceType (REMOTE|HYBRID|ONSITE), experienceLevel (NO_EXPERIENCE|ENTRY_LEVEL|JUNIOR|MID_LEVEL|SENIOR|LEAD|MANAGER),',
      'requiredSkills (string[]), preferredSkills (string[]), country (string?), city (string?), salaryMin (number|null), salaryMax (number|null),',
      'currency (ISO 4217 code like USD, EUR, GBP, PHP, etc, or omit if unknown). Keep description concise but complete.',
      'Raw data:',
      JSON.stringify(raw),
    ].join('\n');

    const response = await this.ai.normalizeJob(prompt);
    if (!response) return null;

    return {
      title: response.title ?? base.title,
      company: response.company ?? base.company,
      description: response.description ?? base.description,
      type: (response.type as any) ?? base.type,
      workplaceType: (response.workplaceType as any) ?? base.workplaceType,
      experienceLevel: (response.experienceLevel as any) ?? base.experienceLevel,
      requiredSkills: Array.isArray(response.requiredSkills) ? response.requiredSkills : base.requiredSkills,
      preferredSkills: Array.isArray(response.preferredSkills) ? response.preferredSkills : base.preferredSkills,
      country: response.country ?? base.country,
      city: response.city ?? base.city,
      salaryMin: response.salaryMin ?? base.salaryMin,
      salaryMax: response.salaryMax ?? base.salaryMax,
      currency: response.currency ?? base.currency,
      applicationUrl: base.applicationUrl,
      sourceUrl: base.sourceUrl,
    };
  }
}
