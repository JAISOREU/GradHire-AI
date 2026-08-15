import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

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

    return jobs.map((item: Record<string, unknown>) => ({
      externalId: String(item.id ?? item.job_id ?? item.externalId ?? `${Date.now()}-${Math.random()}`),
      title: String(item.title ?? item.name ?? 'Untitled'),
      company: String(item.company ?? item.employer ?? 'Unknown'),
      description: String(item.description ?? item.summary ?? ''),
      location: item.location ? String(item.location) : undefined,
      type: item.type ? String(item.type) : undefined,
      workplaceType: item.workplaceType ? String(item.workplaceType) : undefined,
      salaryMin: item.salaryMin ? Number(item.salaryMin) : null,
      salaryMax: item.salaryMax ? Number(item.salaryMax) : null,
      skills: Array.isArray(item.skills) ? item.skills.map((s) => String(s)) : [],
      postedAt: item.postedAt ? this.toDate(item.postedAt) : undefined,
      expiresAt: item.expiresAt ? this.toDate(item.expiresAt) : undefined,
      applicationUrl: String(item.applicationUrl ?? item.url ?? item.apply_url ?? '#'),
      sourceUrl: String(item.url ?? item.sourceUrl ?? source.feedUrl),
      raw: item,
    }));
  }

  private toDate(value: unknown): Date {
    if (value instanceof Date) return value;
    const d = new Date(value as string | number);
    return isNaN(d.getTime()) ? new Date() : d;
  }
}
