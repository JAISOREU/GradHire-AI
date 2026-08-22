import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class UsaJobsAdapter implements SourceAdapter {
  readonly sourceType = 'USAJOBS';
  private readonly logger = new Logger(UsaJobsAdapter.name);

  constructor(private readonly http: HttpService) {}

  async fetch(source: { feedUrl: string; config?: Record<string, unknown> }): Promise<RawJobItem[]> {
    const apiKey = source.config?.apiKey as string | undefined;
    const query = (source.config?.query as string | undefined) ?? 'software engineer';
    const maxResults = Number(source.config?.maxResults ?? 100);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Gradture (contact@gradture.ai)',
    };
    if (apiKey) {
      headers['Authorization-Key'] = apiKey;
    }

    const url = `https://api.usajobs.gov/api/search?ResultsPerPage=${maxResults}&PositionTitle=${encodeURIComponent(query)}`;
    this.logger.debug(`Fetching USAJOBS search: ${url}`);
    const response = await firstValueFrom(this.http.get(url, { headers, timeout: 30000 }));
    const data = response.data;
    const searchResult = (data as any).SearchResult as Record<string, unknown> | undefined;
    const items = searchResult?.SearchResultItems as Record<string, unknown>[] | undefined;
    const jobs = Array.isArray(items) ? items : [];

    return jobs.map((item: Record<string, unknown>): RawJobItem => {
      const job = (item as any).MatchedObjectDescriptor ?? item;
      const description = this.extractDescription(job);
      const salary = this.extractSalary(job);

      return {
        externalId: String(job.PositionID ?? job.id ?? `${Date.now()}-${Math.random()}`),
        title: String(job.PositionTitle ?? 'Untitled'),
        company: String(job.OrganizationName ?? 'USAJOBS'),
        description,
        location: this.extractLocation(job),
        type: this.extractType(job),
        workplaceType: this.extractWorkplaceType(job, description),
        salaryMin: salary.min,
        salaryMax: salary.max,
        skills: this.extractSkills(job),
        postedAt: job.StartDate ? new Date(job.StartDate as string) : undefined,
        applicationUrl: String(job.ApplyURI ?? job.PositionURI ?? '#'),
        sourceUrl: String(job.PositionURI ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private extractDescription(job: Record<string, unknown>): string {
    const summary = job.UserArea as Record<string, unknown> | undefined;
    const desc = summary?.Details as string | undefined;
    if (desc) return desc;
    const duties = job.DutiesSummary as string | undefined;
    if (duties) return duties;
    return String(job.DutiesSummary ?? job.description ?? '');
  }

  private extractLocation(job: Record<string, unknown>): string | undefined {
    const locs = job.PositionLocation as Record<string, unknown>[] | undefined;
    if (!locs?.length) return undefined;
    const parts = [locs[0].City, locs[0].State ?? locs[0].CountryName ?? locs[0].CountrySubDivisionCode].filter(Boolean);
    return parts.length ? String(parts.join(', ')) : undefined;
  }

  private extractType(job: Record<string, unknown>): string | undefined {
    const pt = job.PositionSchedule as string | undefined;
    if (pt) return pt.toUpperCase().replace(/[^A-Z]/g, '_');
    const term = job.PositionScheduleType as string | undefined;
    if (term) return term.toUpperCase().replace(/[^A-Z]/g, '_');
    return undefined;
  }

  private extractWorkplaceType(job: Record<string, unknown>, description: string): string | undefined {
    const text = (description + ' ' + JSON.stringify(job)).toLowerCase();
    if (text.includes('remote') || text.includes('work from home')) return 'REMOTE';
    if (text.includes('hybrid')) return 'HYBRID';
    return 'ONSITE';
  }

  private extractSalary(job: Record<string, unknown>): { min: number | null; max: number | null } {
    const min = Number(job.Minimum ?? job.SalaryMin ?? 0);
    const max = Number(job.Maximum ?? job.SalaryMax ?? 0);
    if (min || max) {
      return { min: min || null, max: max || null };
    }
    return { min: null, max: null };
  }

  private extractSkills(job: Record<string, unknown>): string[] {
    const reqs = job.Requirements as Record<string, unknown> | undefined;
    if (reqs) {
      const skills = reqs.Requirements as string[] | undefined;
      return skills ?? [];
    }
    return [];
  }
}
