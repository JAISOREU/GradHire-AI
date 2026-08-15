import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AiService, NormalizedJobResponse } from '../../ai/ai.service';
import { RawJobItem } from '../adapters/source-adapter.interface';
import { Job, JobSource } from '@prisma/client';

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
    const prompt = [
      'You are a job data normalizer. Map the following raw job item into structured fields.',
      'Return JSON with: title, company, description, type (HIRING|INTERNSHIP|APPRENTICESHIP|CONTRACT|TEMPORARY|FREELANCE|PART_TIME),',
      'workplaceType (REMOTE|HYBRID|ONSITE), experienceLevel (NO_EXPERIENCE|ENTRY_LEVEL|JUNIOR|MID_LEVEL|SENIOR|LEAD|MANAGER),',
      'requiredSkills (string[]), preferredSkills (string[]), country (string?), city (string?), salaryMin (number|null), salaryMax (number|null),',
      'currency (string, default PHP). Keep description concise but complete.',
      'Raw data:',
      JSON.stringify(raw),
    ].join('\n');

    let normalized: NormalizedJob;
    try {
      const response = await this.ai.normalizeJob(prompt);
      if (response) {
        normalized = this.mapAiResponse(raw, response);
      } else {
        normalized = this.fallbackNormalize(raw);
      }
    } catch {
      normalized = this.fallbackNormalize(raw);
    }

    if (!normalized.applicationUrl) {
      normalized.applicationUrl = raw.applicationUrl;
    }
    if (!normalized.sourceUrl) {
      normalized.sourceUrl = raw.sourceUrl;
    }

    return normalized;
  }

  private mapAiResponse(raw: RawJobItem, response: NormalizedJobResponse): NormalizedJob {
    return {
      title: response.title ?? raw.title,
      company: response.company ?? raw.company,
      description: response.description ?? raw.description,
      type: (response.type as any) ?? 'HIRING',
      workplaceType: (response.workplaceType as any) ?? 'ONSITE',
      experienceLevel: (response.experienceLevel as any) ?? 'ENTRY_LEVEL',
      requiredSkills: Array.isArray(response.requiredSkills) ? response.requiredSkills : [],
      preferredSkills: Array.isArray(response.preferredSkills) ? response.preferredSkills : [],
      country: response.country,
      city: response.city,
      salaryMin: response.salaryMin ?? raw.salaryMin,
      salaryMax: response.salaryMax ?? raw.salaryMax,
      currency: response.currency ?? 'PHP',
      applicationUrl: raw.applicationUrl,
      sourceUrl: raw.sourceUrl,
    };
  }

  private fallbackNormalize(raw: RawJobItem): NormalizedJob {
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
    const workplaceType = ['REMOTE', 'HYBRID', 'ONSITE'].includes(workplaceRaw) ? (workplaceRaw as Job['workplaceType']) : 'ONSITE';

    const allSkills = raw.skills ?? [];
    const requiredSkills = allSkills.slice(0, Math.ceil(allSkills.length * 0.7));
    const preferredSkills = allSkills.slice(requiredSkills.length);

    return {
      title: raw.title,
      company: raw.company,
      description: raw.description,
      type,
      workplaceType,
      experienceLevel: 'ENTRY_LEVEL',
      requiredSkills,
      preferredSkills,
      country: raw.location?.split(',').pop()?.trim(),
      city: raw.location?.split(',')[0]?.trim(),
      salaryMin: raw.salaryMin,
      salaryMax: raw.salaryMax,
      currency: 'PHP',
      applicationUrl: raw.applicationUrl,
      sourceUrl: raw.sourceUrl,
    };
  }
}
