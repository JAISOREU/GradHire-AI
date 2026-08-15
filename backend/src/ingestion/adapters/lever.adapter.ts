import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class LeverAdapter implements SourceAdapter {
  readonly sourceType = 'LEVER';
  private readonly logger = new Logger(LeverAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown> }): Promise<RawJobItem[]> {
    const company = source.config?.company as string | undefined;
    if (!company) {
      throw new Error('Lever company is required in config');
    }

    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`;
    this.logger.debug(`Fetching Lever postings: ${url}`);
    const response = await firstValueFrom(this.http.get(url, { timeout: 30000 }));
    const data = response.data;
    const jobs = Array.isArray(data) ? data : [];

    return jobs.map((item: Record<string, unknown>): RawJobItem => {
      const description = this.extractDescription(item);
      const salary = this.extractSalary(description);
      const workplaceType = this.extractWorkplaceType(description, item);

      return {
        externalId: String((item as any).id ?? `${Date.now()}-${Math.random()}`),
        title: String((item as any).text ?? (item as any).title ?? 'Untitled'),
        company: String((item as any).company ?? company),
        description,
        location: (item as any).location ? String((item as any).location) : undefined,
        type: this.extractType(item),
        workplaceType,
        salaryMin: salary.min,
        salaryMax: salary.max,
        skills: this.extractSkills(item),
        postedAt: (item as any).createdAt ? new Date((item as any).createdAt) : undefined,
        applicationUrl: String((item as any).applyUrl ?? (item as any).redirectUrl ?? '#'),
        sourceUrl: String((item as any).redirectUrl ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private extractDescription(item: Record<string, unknown>): string {
    const lists = (item as any).lists as Record<string, unknown>[] | undefined;
    if (lists?.length) {
      return lists.map((l) => (l.text ? String(l.text) : '')).join('\n');
    }
    return String((item as any).description ?? (item as any).text ?? '');
  }

  private extractType(item: Record<string, unknown>): string | undefined {
    const cats = (item as any).categories as Record<string, unknown> | undefined;
    if (!cats) return undefined;
    return cats.commitment ? String(cats.commitment) : undefined;
  }

  private extractWorkplaceType(description: string, item: Record<string, unknown>): string | undefined {
    const text = (description + ' ' + JSON.stringify(item)).toLowerCase();
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
    const tags = (item as any).tags as string[] | undefined;
    return tags ?? [];
  }
}
