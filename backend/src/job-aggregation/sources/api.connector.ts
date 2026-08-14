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
    const fieldMapping = (source.configuration?.fieldMapping as Record<string, string> | undefined) ?? {};

    return items.map((item: any, index: number) => {
      const mapped = this.applyFieldMapping(item, fieldMapping);
      return {
        title: mapped.title ?? item.title ?? item.name ?? `Untitled ${index}`,
        company: mapped.company ?? item.company ?? item.employer ?? 'Unknown',
        description: this.stripHtml(mapped.description ?? item.description ?? item.summary ?? item.content ?? ''),
        requirements: this.splitList(mapped.requirements ?? item.requirements),
        skills: this.splitList(mapped.skills ?? item.skills),
        employmentType: mapped.employmentType ?? item.employmentType ?? item.jobType ?? item.type,
        workplaceType: mapped.workplaceType ?? item.workplaceType,
        location: mapped.location ?? item.location ?? item.address,
        country: mapped.country ?? item.country,
        city: mapped.city ?? item.city,
        salaryMin: this.parseNumber(mapped.salaryMin ?? item.salaryMin),
        salaryMax: this.parseNumber(mapped.salaryMax ?? item.salaryMax),
        salaryCurrency: mapped.salaryCurrency ?? item.salaryCurrency,
        salaryFrequency: mapped.salaryFrequency ?? item.salaryFrequency,
        experienceLevel: mapped.experienceLevel ?? item.experienceLevel,
        benefits: this.splitList(mapped.benefits ?? item.benefits),
        applicationDeadline: mapped.applicationDeadline ?? item.applicationDeadline,
        sourceUrl: mapped.sourceUrl ?? item.url ?? item.link ?? source.baseUrl,
        originalPostingDate: mapped.originalPostingDate ?? item.publishedAt ?? item.createdAt,
      };
    }).filter((job: RawJobPosting) => Boolean(job.title));
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

  private applyFieldMapping(item: any, mapping: Record<string, string>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [target, source] of Object.entries(mapping)) {
      const parts = source.split('.');
      let current: any = item;
      for (const part of parts) {
        current = current?.[part];
      }
      result[target] = current;
    }
    return result;
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

  private parseNumber(value: any): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed));
    return undefined;
  }
}
