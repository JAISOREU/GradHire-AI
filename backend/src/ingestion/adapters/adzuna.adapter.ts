import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class AdzunaAdapter implements SourceAdapter {
  readonly sourceType = 'ADZUNA';
  private readonly logger = new Logger(AdzunaAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown> }): Promise<RawJobItem[]> {
    const appId = source.config?.appId as string | undefined;
    const appKey = source.config?.appKey as string | undefined;
    const country = (source.config?.country as string | undefined) ?? 'us';
    const query = (source.config?.query as string | undefined) ?? '';
    const maxPages = (source.config?.maxPages as number | undefined) ?? 1;

    if (!appId || !appKey) {
      throw new Error('Adzuna appId and appKey are required in config');
    }

    let page = 1;
    let allResults: Record<string, unknown>[] = [];

    while (page <= maxPages) {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=50&content-type=json${query ? '&q=' + encodeURIComponent(query) : ''}`;
      this.logger.debug(`Fetching Adzuna page ${page}: ${url.replace(new RegExp(`app_id=${encodeURIComponent(appId)}`, 'g'), 'app_id=***').replace(new RegExp(`app_key=${encodeURIComponent(appKey)}`, 'g'), 'app_key=***')}`);
      const response = await firstValueFrom(this.http.get(url, { timeout: 30000 }));
      const data = response.data;
      const results = Array.isArray(data.results) ? data.results : [];
      allResults = allResults.concat(results);

      const totalCount = Number(data.count ?? 0);
      if (page * 50 >= totalCount) break;
      page++;
    }

    return allResults.map((item: Record<string, unknown>): RawJobItem => {
      const description = String((item as any).description ?? (item as any).full_description ?? '');
      const salary = this.extractSalary(item, description);

      return {
        externalId: String((item as any).id ?? (item as any).adref ?? `${Date.now()}-${Math.random()}`),
        title: String((item as any).title ?? 'Untitled'),
        company: String((item as any).company?.display_name ?? (item as any).company ?? 'Unknown'),
        description,
        location: this.extractLocation(item),
        type: this.extractType(item),
        workplaceType: this.extractWorkplaceType(description, item),
        salaryMin: salary.min,
        salaryMax: salary.max,
        skills: this.extractSkills(item),
        postedAt: (item as any).date ? new Date((item as any).date) : undefined,
        applicationUrl: String((item as any).redirect_url ?? (item as any).adref ?? '#'),
        sourceUrl: String((item as any).redirect_url ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private extractLocation(item: Record<string, unknown>): string | undefined {
    const loc = (item as any).location as Record<string, unknown> | undefined;
    if (!loc) return undefined;
    const parts: string[] = [];
    if (loc.display_name) parts.push(String(loc.display_name));
    if ((loc as any).area?.length) {
      parts.push(String((loc as any).area.join(', ')));
    }
    return parts.length ? String(parts.join(', ')) : undefined;
  }

  private extractType(item: Record<string, unknown>): string | undefined {
    const contract = (item as any).contract_type as string | undefined;
    if (contract) return contract.toUpperCase().replace(/[^A-Z]/g, '_');
    return undefined;
  }

  private extractWorkplaceType(description: string, item: Record<string, unknown>): string | undefined {
    const text = (description + ' ' + JSON.stringify(item)).toLowerCase();
    if (text.includes('remote') || text.includes('work from home')) return 'REMOTE';
    if (text.includes('hybrid')) return 'HYBRID';
    return 'ONSITE';
  }

  private extractSalary(item: Record<string, unknown>, description: string): { min: number | null; max: number | null } {
    const salaryMin = Number((item as any).salary_min ?? 0);
    const salaryMax = Number((item as any).salary_max ?? 0);
    if (salaryMin || salaryMax) {
      return { min: salaryMin || null, max: salaryMax || null };
    }
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
