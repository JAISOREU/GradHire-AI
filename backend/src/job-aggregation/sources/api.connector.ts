import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JobSourceConnector, RawJobPosting } from './job-source.interface';

@Injectable()
export class ApiConnector implements JobSourceConnector {
  sourceType = 'API';
  private readonly logger = new Logger(ApiConnector.name);

  constructor(private readonly http: HttpService) {}

  async discoverJobs(source: { id: string; baseUrl: string; configuration?: Record<string, unknown> }): Promise<RawJobPosting[]> {
    const timeout = (source.configuration?.timeout as number | undefined) ?? 10000;
    const response = await firstValueFrom(
      this.http.get(source.baseUrl, { timeout, headers: { Accept: 'application/json' } }),
    );

    const data = response.data;
    const items = this.extractItems(data, source.configuration);

    return items.map((item: any, index: number) => ({
      title: item.title ?? item.name ?? `Untitled ${index}`,
      company: item.company ?? item.employer ?? 'Unknown',
      description: this.stripHtml(item.description ?? item.summary ?? item.content ?? ''),
      requirements: this.splitList(item.requirements),
      skills: this.splitList(item.skills),
      employmentType: item.employmentType ?? item.jobType ?? item.type,
      workplaceType: item.workplaceType,
      location: item.location ?? item.address,
      country: item.country,
      city: item.city,
      salaryMin: item.salaryMin ? Number(item.salaryMin) : undefined,
      salaryMax: item.salaryMax ? Number(item.salaryMax) : undefined,
      salaryCurrency: item.salaryCurrency,
      salaryFrequency: item.salaryFrequency,
      experienceLevel: item.experienceLevel,
      benefits: this.splitList(item.benefits),
      applicationDeadline: item.applicationDeadline,
      sourceUrl: item.url ?? item.link ?? source.baseUrl,
      originalPostingDate: item.publishedAt ?? item.createdAt,
    })).filter((job: RawJobPosting) => Boolean(job.title));
  }

  async fetchJob(url: string): Promise<RawJobPosting> {
    const response = await firstValueFrom(this.http.get(url, { timeout: 10000 }));
    const data = response.data;
    return this.normalizeApiItem(data, url);
  }

  private extractItems(data: any, configuration?: Record<string, unknown>): any[] {
    if (!data) return [];
    const path = (configuration?.itemsPath as string | undefined) ?? 'jobs';
    const parts = path.split('.');
    let current: any = data;
    for (const part of parts) {
      current = current?.[part];
    }
    if (Array.isArray(current)) return current;
    if (current && typeof current === 'object') return [current];
    return [];
  }

  private normalizeApiItem(item: any, url: string): RawJobPosting {
    return {
      title: item.title ?? item.name ?? 'Untitled',
      company: item.company ?? item.employer ?? 'Unknown',
      description: this.stripHtml(item.description ?? item.summary ?? item.content ?? ''),
      sourceUrl: item.url ?? item.link ?? url,
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private splitList(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    return String(value)
      .split(/[,;|]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
