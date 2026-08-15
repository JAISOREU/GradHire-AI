import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class AshbyAdapter implements SourceAdapter {
  readonly sourceType = 'ASHBY';
  private readonly logger = new Logger(AshbyAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown> }): Promise<RawJobItem[]> {
    const company = source.config?.company as string | undefined;
    if (!company) {
      throw new Error('Ashby company is required in config');
    }

    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(company)}`;
    this.logger.debug(`Fetching Ashby job board: ${url}`);
    const response = await firstValueFrom(this.http.get(url, { timeout: 30000 }));
    const data = response.data;
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];

    return jobs.map((item: Record<string, unknown>): RawJobItem => {
      const description = this.extractDescription(item);
      const salary = this.extractSalary(description);

      return {
        externalId: String((item as any).id ?? `${Date.now()}-${Math.random()}`),
        title: String((item as any).title ?? 'Untitled'),
        company: String((item as any).company?.name ?? (item as any).company ?? company),
        description,
        location: this.extractLocation(item),
        type: (item as any).employmentType ? String((item as any).employmentType) : undefined,
        workplaceType: this.extractWorkplaceType(item),
        salaryMin: salary.min,
        salaryMax: salary.max,
        skills: this.extractSkills(item),
        postedAt: (item as any).createdAt ? new Date((item as any).createdAt) : undefined,
        applicationUrl: String((item as any).applyUrl ?? (item as any).url ?? '#'),
        sourceUrl: String((item as any).applyUrl ?? (item as any).url ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private extractDescription(item: Record<string, unknown>): string {
    const desc = (item as any).description as string | undefined;
    if (desc) return desc;
    const body = (item as any).descriptionBody as string | undefined;
    if (body) return body;
    const sections = (item as any).sections as Record<string, unknown>[] | undefined;
    if (sections?.length) {
      return sections.map((s) => String((s as any).text ?? (s as any).content ?? '')).join('\n');
    }
    return '';
  }

  private extractLocation(item: Record<string, unknown>): string | undefined {
    const loc = (item as any).location as Record<string, unknown> | undefined;
    if (!loc) return undefined;
    const parts = [loc.city, loc.region, loc.country, loc.name].filter(Boolean);
    return parts.length ? String(parts.join(', ')) : undefined;
  }

  private extractWorkplaceType(item: Record<string, unknown>): string | undefined {
    const text = JSON.stringify(item).toLowerCase();
    if (text.includes('remote') || text.includes('work from home')) return 'REMOTE';
    if (text.includes('hybrid')) return 'HYBRID';
    return 'ONSITE';
  }

  private extractSalary(description: string): { min: number | null; max: number | null } {
    const match = description.match(/\$[\d,]+(?:\.\d+)?\s*[-–]\s*\$[\d,]+(?:\.\d+)?/);
    if (!match) return { min: null, max: null };
    const parts = match[0].split(/[-–]/).map((p) => parseFloat(p.replace(/[$,]/g, '')));
    return { min: parts[0] || null, max: parts[1] || parts[0] || null };
  }

  private extractSkills(item: Record<string, unknown>): string[] {
    const skills = (item as any).skills as string[] | undefined;
    return skills ?? [];
  }
}
