import { Injectable, Logger } from '@nestjs/common';

export interface SanitizedJobPosting {
  title: string;
  company: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  employmentType?: string;
  workplaceType?: string;
  location?: string;
  country?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryFrequency?: string;
  experienceLevel?: string;
  benefits?: string[];
  applicationDeadline?: string;
  industry?: string;
  sourceUrl: string;
  originalPostingDate?: string;
}

@Injectable()
export class SanitizationService {
  private readonly logger = new Logger(SanitizationService.name);
  private readonly blockedProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
  private readonly blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

  sanitize(raw: Record<string, unknown>): SanitizedJobPosting {
    const title = this.sanitizeString(raw.title, 'Untitled') ?? 'Untitled';
    const company = this.sanitizeString(raw.company, 'Unknown') ?? 'Unknown';
    const description = this.sanitizeHtml((raw.description as string | undefined) ?? '');
    const sourceUrl = this.sanitizeUrl(raw.sourceUrl as string | undefined);

    if (!sourceUrl) {
      throw new Error('Invalid or missing sourceUrl');
    }

    return {
      title: title.slice(0, 255),
      company: company.slice(0, 255),
      description: description.slice(0, 20000),
      requirements: this.sanitizeStringArray(raw.requirements),
      responsibilities: this.sanitizeStringArray(raw.responsibilities),
      skills: this.sanitizeStringArray(raw.skills),
      employmentType: this.sanitizeEnum(raw.employmentType as string | undefined, ['HIRING', 'INTERNSHIP', 'APPRENTICESHIP', 'CONTRACT', 'TEMPORARY', 'FREELANCE', 'PART_TIME']),
      workplaceType: this.sanitizeEnum(raw.workplaceType as string | undefined, ['REMOTE', 'HYBRID', 'ONSITE']),
      location: this.sanitizeString(raw.location, undefined, 255),
      country: this.sanitizeString(raw.country, undefined, 100),
      city: this.sanitizeString(raw.city, undefined, 100),
      salaryMin: this.sanitizeNumber(raw.salaryMin),
      salaryMax: this.sanitizeNumber(raw.salaryMax),
      salaryCurrency: this.sanitizeCurrency(raw.salaryCurrency as string | undefined),
      salaryFrequency: this.sanitizeEnum(raw.salaryFrequency as string | undefined, ['ANNUAL', 'MONTHLY', 'HOURLY', 'DAILY', 'PROJECT_BASED']),
      experienceLevel: this.sanitizeEnum(raw.experienceLevel as string | undefined, ['NO_EXPERIENCE', 'ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER']),
      benefits: this.sanitizeStringArray(raw.benefits),
      applicationDeadline: this.sanitizeDate(raw.applicationDeadline as string | undefined),
      industry: this.sanitizeString(raw.industry, undefined, 100),
      sourceUrl,
      originalPostingDate: this.sanitizeDate(raw.originalPostingDate as string | undefined),
    };
  }

  private sanitizeString(value: unknown, fallback: string | undefined, maxLength = 255): string | undefined {
    if (typeof value !== 'string') return fallback;
    const cleaned = value.replace(/[<>]/g, '').trim();
    if (!cleaned) return fallback;
    return cleaned.slice(0, maxLength);
  }

  private sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .slice(0, 20000);
  }

  private sanitizeUrl(url: string | undefined): string | null {
    if (typeof url !== 'string') return null;
    try {
      const parsed = new URL(url);
      const protocol = parsed.protocol.toLowerCase();
      if (!this.blockedProtocols.includes(protocol)) {
        return url;
      }
    } catch {
      // ignore invalid URLs
    }
    return null;
  }

  private sanitizeEnum(value: string | undefined, allowed: string[]): string | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    return allowed.includes(upper) ? upper : undefined;
  }

  private sanitizeNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed));
    }
    return undefined;
  }

  private sanitizeCurrency(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase().slice(0, 3);
    return upper;
  }

  private sanitizeDate(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }

  private sanitizeStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value
      .map((v) => this.sanitizeString(v, undefined, 255))
      .filter((v): v is string => Boolean(v))
      .slice(0, 50);
  }
}
