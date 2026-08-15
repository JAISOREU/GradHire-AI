import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class SmartRecruitersAdapter implements SourceAdapter {
  readonly sourceType = 'SMARTRECRUITERS';
  private readonly logger = new Logger(SmartRecruitersAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown> }): Promise<RawJobItem[]> {
    const company = source.config?.company as string | undefined;
    if (!company) {
      throw new Error('SmartRecruiters company is required in config');
    }

    const url = `https://api.smartrecruiters.com/v1/jobs?company=${encodeURIComponent(company)}&limit=100`;
    this.logger.debug(`Fetching SmartRecruiters jobs: ${url}`);
    const response = await firstValueFrom(this.http.get(url, { timeout: 30000 }));
    const data = response.data;
    const jobs = Array.isArray(data.content) ? data.content : [];

    return jobs.map((item: Record<string, unknown>): RawJobItem => {
      const description = this.extractDescription(item);
      const salary = this.extractSalary(description);

      return {
        externalId: String((item as any).id ?? `${Date.now()}-${Math.random()}`),
        title: String((item as any).title ?? 'Untitled'),
        company: String((item as any).company?.name ?? (item as any).company ?? company),
        description,
        location: this.extractLocation(item),
        type: (item as any).type?.label ? String((item as any).type.label) : undefined,
        workplaceType: this.extractWorkplaceType(item),
        salaryMin: salary.min,
        salaryMax: salary.max,
        skills: this.extractSkills(item),
        postedAt: (item as any).publishedAt ? new Date((item as any).publishedAt) : (item as any).updatedAt ? new Date((item as any).updatedAt) : undefined,
        applicationUrl: String((item as any).applyUrl ?? (item as any).referenceNumber ?? '#'),
        sourceUrl: String((item as any).applyUrl ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private extractDescription(item: Record<string, unknown>): string {
    const desc = (item as any).description as Record<string, unknown> | undefined;
    if (!desc) return '';
    return String(desc.text ?? desc.value ?? desc.content ?? '');
  }

  private extractLocation(item: Record<string, unknown>): string | undefined {
    const locs = (item as any).locations as Record<string, unknown>[] | undefined;
    if (!locs?.length) return undefined;
    const parts = [locs[0].city, locs[0].region, locs[0].country, locs[0].name].filter(Boolean);
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
