import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

type FieldMap = Record<string, string>;

@Injectable()
export class ApiSourceAdapter implements SourceAdapter {
  readonly sourceType = 'API';
  private readonly logger = new Logger(ApiSourceAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown>; rateLimit?: number }): Promise<RawJobItem[]> {
    const url = source.feedUrl;
    this.logger.debug(`Fetching API source: ${url}`);
    const response = await firstValueFrom(this.http.get(url, { timeout: 30000 }));
    const data = response.data;

    const jobs = Array.isArray(data) ? data : data.jobs ?? data.results ?? [];
    if (!Array.isArray(jobs)) {
      return [];
    }

    const fieldMap = (source.config?.fieldMap as FieldMap | undefined) ?? {};
    const mapped = this.mapFields(fieldMap);

    return jobs.map((item: Record<string, unknown>) => {
      const raw: RawJobItem = {
        externalId: mapped.externalId(item) ?? `${Date.now()}-${Math.random()}`,
        title: mapped.title(item) ?? 'Untitled',
        company: mapped.company(item) ?? 'Unknown',
        description: mapped.description(item) ?? '',
        location: mapped.location(item),
        type: mapped.type(item) ?? 'HIRING',
        workplaceType: mapped.workplaceType(item) ?? 'ONSITE',
        salaryMin: mapped.salaryMin(item) ?? null,
        salaryMax: mapped.salaryMax(item) ?? null,
        skills: mapped.skills(item) ?? [],
        postedAt: mapped.postedAt(item),
        expiresAt: mapped.expiresAt(item),
        applicationUrl: mapped.applicationUrl(item) ?? '#',
        sourceUrl: mapped.sourceUrl(item, source.feedUrl),
        raw: item,
      };
      return raw;
    });
  }

  private mapFields(fieldMap: FieldMap) {
    const getString = (field: string, fallbacks: string[]): ((item: Record<string, unknown>) => string | undefined) => {
      const mapped = fieldMap[field];
      const candidates = mapped ? [mapped, ...fallbacks] : fallbacks;
      return (item: Record<string, unknown>) => {
        for (const key of candidates) {
          const value = item[key];
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value);
          }
        }
        return undefined;
      };
    };

    const getStringArray = (field: string, fallbacks: string[]): ((item: Record<string, unknown>) => string[] | undefined) => {
      const mapped = fieldMap[field];
      const candidates = mapped ? [mapped, ...fallbacks] : fallbacks;
      return (item: Record<string, unknown>) => {
        for (const key of candidates) {
          const value = item[key];
          if (Array.isArray(value)) {
            return value.map((v) => String(v));
          }
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value).split(',').map((s) => s.trim()).filter(Boolean);
          }
        }
        return undefined;
      };
    };

    const getNumber = (field: string, fallbacks: string[]): ((item: Record<string, unknown>) => number | null | undefined) => {
      const mapped = fieldMap[field];
      const candidates = mapped ? [mapped, ...fallbacks] : fallbacks;
      return (item: Record<string, unknown>) => {
        for (const key of candidates) {
          const value = item[key];
          if (value !== undefined && value !== null) {
            const num = Number(value);
            return isNaN(num) ? null : num;
          }
        }
        return undefined;
      };
    };

    const getDate = (field: string, fallbacks: string[]): ((item: Record<string, unknown>) => Date | undefined) => {
      const mapped = fieldMap[field];
      const candidates = mapped ? [mapped, ...fallbacks] : fallbacks;
      return (item: Record<string, unknown>) => {
        for (const key of candidates) {
          const value = item[key];
          if (value !== undefined && value !== null) {
            const d = new Date(value as string | number);
            return isNaN(d.getTime()) ? undefined : d;
          }
        }
        return undefined;
      };
    };

    return {
      externalId: getString('externalId', ['id', 'job_id', 'externalId']),
      title: getString('title', ['jobTitle', 'name', 'title']),
      company: getString('company', ['companyName', 'employer', 'company']),
      description: getString('description', ['jobDescription', 'summary', 'description']),
      location: getString('location', ['jobGeo', 'location', 'city']),
      type: getString('type', ['jobType', 'type', 'employment_type']),
      workplaceType: getString('workplaceType', ['jobLocationType', 'workplaceType', 'remote']),
      salaryMin: getNumber('salaryMin', ['minSalary', 'salaryMin', 'salary_min']),
      salaryMax: getNumber('salaryMax', ['maxSalary', 'salaryMax', 'salary_max']),
      skills: getStringArray('skills', ['skills', 'tags', 'categories']),
      postedAt: getDate('postedAt', ['pubDate', 'postedAt', 'publishedAt', 'date']),
      expiresAt: getDate('expiresAt', ['expiryDate', 'expiresAt', 'closingDate']),
      applicationUrl: getString('applicationUrl', ['url', 'applyUrl', 'applicationUrl', 'link']),
      sourceUrl: (item: Record<string, unknown>, fallback: string) => {
        const candidates = ['url', 'sourceUrl', 'link'];
        for (const key of candidates) {
          const value = item[key];
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value);
          }
        }
        return fallback;
      },
    };
  }

  private toDate(value: unknown): Date {
    if (value instanceof Date) return value;
    const d = new Date(value as string | number);
    return isNaN(d.getTime()) ? new Date() : d;
  }
}
