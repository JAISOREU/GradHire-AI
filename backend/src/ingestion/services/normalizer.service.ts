import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AiService, NormalizedJobResponse } from '../../ai/ai.service';
import { RawJobItem } from '../adapters/source-adapter.interface';
import { Job, JobSource, JobSourceParserType } from '@prisma/client';

export interface NormalizedJob {
  title: string;
  company: string;
  description: string;
  type: Job['type'];
  workplaceType: Job['workplaceType'];
  experienceLevel: Job['experienceLevel'];
  requiredSkills: string[];
  preferredSkills: string[];
  country?: string;
  city?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  applicationUrl: string;
  sourceUrl: string;
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

    return enriched;
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

    return {
      title: raw.title,
      company: raw.company,
      description: raw.description,
      type,
      workplaceType,
      experienceLevel: 'ENTRY_LEVEL',
      requiredSkills,
      preferredSkills,
      country: country || undefined,
      city: city || undefined,
      salaryMin,
      salaryMax,
      currency: 'PHP',
      applicationUrl: raw.applicationUrl,
      sourceUrl: raw.sourceUrl,
    };
  }

  private async tryAiEnrichment(source: JobSource, raw: RawJobItem, base: NormalizedJob): Promise<NormalizedJob | null> {
    const prompt = [
      'You are a job data normalizer. Map the following raw job item into structured fields.',
      'Return JSON with: title, company, description, type (HIRING|INTERNSHIP|APPRENTICESHIP|CONTRACT|TEMPORARY|FREELANCE|PART_TIME),',
      'workplaceType (REMOTE|HYBRID|ONSITE), experienceLevel (NO_EXPERIENCE|ENTRY_LEVEL|JUNIOR|MID_LEVEL|SENIOR|LEAD|MANAGER),',
      'requiredSkills (string[]), preferredSkills (string[]), country (string?), city (string?), salaryMin (number|null), salaryMax (number|null),',
      'currency (string, default PHP). Keep description concise but complete.',
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
