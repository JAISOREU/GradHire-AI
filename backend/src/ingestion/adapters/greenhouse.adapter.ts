import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class GreenhouseAdapter implements SourceAdapter {
  readonly sourceType = 'GREENHOUSE';
  private readonly logger = new Logger(GreenhouseAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown> }): Promise<RawJobItem[]> {
    const boardToken = source.config?.boardToken as string | undefined;
    if (!boardToken) {
      throw new Error('Greenhouse boardToken is required in config');
    }

    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs`;
    this.logger.debug(`Fetching Greenhouse board: ${url}`);
    const response = await firstValueFrom(this.http.get(url, { timeout: 30000 }));
    const data = response.data;
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];

    return jobs.map((item: Record<string, unknown>): RawJobItem => {
      const location = this.extractLocation(item);
      const content = this.extractContent(item);
      const salary = this.extractSalary(content);

      return {
        externalId: String((item as any).id ?? `${Date.now()}-${Math.random()}`),
        title: String((item as any).title ?? 'Untitled'),
        company: String((item as any).company?.name ?? (item as any).company ?? 'Unknown'),
        description: String((item as any).content ?? (item as any).description ?? content ?? ''),
        location,
        type: (item as any).departments?.length ? String((item as any).departments[0].name) : undefined,
        workplaceType: this.extractWorkplaceType(item),
        salaryMin: salary.min,
        salaryMax: salary.max,
        skills: this.extractSkills(item),
        postedAt: (item as any).updated_at ? new Date((item as any).updated_at) : undefined,
        applicationUrl: String((item as any).absolute_url ?? '#'),
        sourceUrl: String((item as any).absolute_url ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private extractLocation(item: Record<string, unknown>): string | undefined {
    const loc = (item as any).location as Record<string, unknown> | undefined;
    if (!loc) return undefined;
    const parts = [loc.name, loc.office, loc.city, loc.region, loc.country].filter(Boolean);
    return parts.length ? String(parts.join(', ')) : undefined;
  }

  private extractContent(item: Record<string, unknown>): string | undefined {
    const content = (item as any).content as Record<string, unknown> | undefined;
    if (!content) return undefined;
    return content.description ? String(content.description) : String(content);
  }

  private extractWorkplaceType(item: Record<string, unknown>): string | undefined {
    const content = (item as any).content as Record<string, unknown> | undefined;
    if (!content) return undefined;
    const text = JSON.stringify(content).toLowerCase();
    if (text.includes('remote') || text.includes('work from home')) return 'REMOTE';
    if (text.includes('hybrid')) return 'HYBRID';
    return 'ONSITE';
  }

  private extractSalary(content?: string): { min: number | null; max: number | null } {
    if (!content) return { min: null, max: null };
    const match = content.match(/\$[\d,]+(?:\.\d+)?\s*[-–]\s*\$[\d,]+(?:\.\d+)?/);
    if (!match) return { min: null, max: null };
    const parts = match[0].split(/[-–]/).map((p) => parseFloat(p.replace(/[$,]/g, '')));
    return { min: parts[0] || null, max: parts[1] || parts[0] || null };
  }

  private extractSkills(item: Record<string, unknown>): string[] {
    const departments = (item as any).departments as Record<string, unknown>[] | undefined;
    if (departments?.length) {
      return departments.map((d) => String(d.name));
    }
    const skills = (item as any).skills as string[] | undefined;
    return skills ?? [];
  }
}
