import { Injectable, Logger } from '@nestjs/common';
import { JobSourceConnector, RawJobPosting } from './sources/job-source.interface';

export interface NormalizedJob extends RawJobPosting {
  normalizedTitle: string;
  normalizedCompany: string;
  normalizedLocation: string;
  normalizedEmploymentType?: string;
  normalizedWorkplaceType?: string;
  normalizedExperienceLevel?: string;
  confidence: Record<string, { value: string | undefined; confidence: number }>;
}

@Injectable()
export class JobNormalizer {
  private readonly logger = new Logger(JobNormalizer.name);

  normalize(raw: RawJobPosting): NormalizedJob {
    const confidence: Record<string, { value: string | undefined; confidence: number }> = {};

    const normalizedTitle = this.normalizeText(raw.title);
    confidence.title = { value: normalizedTitle, confidence: 0.9 };

    const normalizedCompany = this.normalizeText(raw.company);
    confidence.company = { value: normalizedCompany, confidence: 0.9 };

    const normalizedLocation = this.normalizeLocation(raw.location, raw.city, raw.country);
    confidence.location = { value: normalizedLocation, confidence: 0.8 };

    const normalizedWorkplaceType = this.normalizeWorkplaceType(raw.workplaceType);
    confidence.workplaceType = { value: normalizedWorkplaceType, confidence: 0.85 };

    const normalizedEmploymentType = this.normalizeEmploymentType(raw.employmentType);
    confidence.employmentType = { value: normalizedEmploymentType, confidence: 0.8 };

    const normalizedExperienceLevel = this.normalizeExperienceLevel(raw.experienceLevel);
    confidence.experienceLevel = { value: normalizedExperienceLevel, confidence: 0.75 };

    return {
      ...raw,
      normalizedTitle,
      normalizedCompany,
      normalizedLocation,
      normalizedEmploymentType,
      normalizedWorkplaceType,
      normalizedExperienceLevel,
      confidence,
    };
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private normalizeLocation(location?: string, city?: string, country?: string): string {
    const parts = [location, city, country].filter((p): p is string => Boolean(p)).map((p) => this.normalizeText(p));
    return parts.join(', ') || 'Unknown';
  }

  private normalizeWorkplaceType(value?: string): string | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    if (upper.includes('REMOTE')) return 'REMOTE';
    if (upper.includes('HYBRID')) return 'HYBRID';
    if (upper.includes('ONSITE') || upper.includes('ON-SITE') || upper.includes('IN OFFICE')) return 'ONSITE';
    return undefined;
  }

  private normalizeEmploymentType(value?: string): string | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    if (upper.includes('FULL') && upper.includes('TIME')) return 'HIRING';
    if (upper.includes('PART') && upper.includes('TIME')) return 'PART_TIME';
    if (upper.includes('CONTRACT')) return 'CONTRACT';
    if (upper.includes('INTERNSHIP')) return 'INTERNSHIP';
    if (upper.includes('FREELANCE')) return 'FREELANCE';
    if (upper.includes('TEMPORARY')) return 'TEMPORARY';
    return undefined;
  }

  private normalizeExperienceLevel(value?: string): string | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    if (upper.includes('ENTRY') || upper.includes('JUNIOR') || upper.includes('GRADUATE')) return 'ENTRY_LEVEL';
    if (upper.includes('MID')) return 'MID_LEVEL';
    if (upper.includes('SENIOR')) return 'SENIOR';
    if (upper.includes('LEAD')) return 'LEAD';
    if (upper.includes('MANAGER') || upper.includes('DIRECTOR')) return 'MANAGER';
    return undefined;
  }
}
