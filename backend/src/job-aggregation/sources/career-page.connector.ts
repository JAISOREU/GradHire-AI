import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JobSourceConnector, RawJobPosting } from './job-source.interface';

@Injectable()
export class CareerPageConnector implements JobSourceConnector {
  sourceType = 'CAREER_PAGE';
  private readonly logger = new Logger(CareerPageConnector.name);

  constructor(private readonly http: HttpService) {}

  async discoverJobs(source: { id: string; baseUrl: string; configuration?: Record<string, unknown> }): Promise<RawJobPosting[]> {
    const timeout = (source.configuration?.timeout as number | undefined) ?? 10000;
    const response = await firstValueFrom(this.http.get(source.baseUrl, { timeout, headers: { Accept: 'text/html' } }));
    const html = typeof response.data === 'string' ? response.data : response.data?.toString?.() ?? '';
    const selectors = (source.configuration?.selectors as Record<string, string> | undefined) ?? {};
    return this.parseCareerPage(html, source.baseUrl, selectors);
  }

  async fetchJob(url: string): Promise<RawJobPosting> {
    const response = await firstValueFrom(this.http.get(url, { timeout: 10000 }));
    const html = typeof response.data === 'string' ? response.data : response.data?.toString?.() ?? '';
    const items = this.parseCareerPage(html, url, {});
    return items[0] ?? { title: 'Untitled', company: 'Unknown', description: '', sourceUrl: url };
  }

  private parseCareerPage(html: string, baseUrl: string, selectors: Record<string, string>): RawJobPosting[] {
    const jobs: RawJobPosting[] = [];
    const titleSelector = selectors.titleSelector ?? 'h1, h2, h3, h4, h5, h6';
    const titleRegex = new RegExp(`<(${titleSelector.replace(/h[1-6]/g, 'h[1-6]').split(', ').join('|').replace(/[^a-zA-Z0-9|]/g, '')})[^>]*>(.*?)<\/${titleSelector}>`, 'gi');
    
    const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      const title = this.stripHtml(match[1] ?? '').trim();
      if (!title || title.length < 5) continue;

      const start = match.index;
      const nextHeading = html.indexOf('<h', start + 1);
      const snippet = html.slice(start, nextHeading === -1 ? undefined : nextHeading);
      const description = this.stripHtml(snippet).trim();

      jobs.push({
        title,
        company: this.inferCompany(baseUrl),
        description: description.slice(0, 5000),
        sourceUrl: baseUrl,
      });
    }

    if (jobs.length === 0) {
      jobs.push({
        title: this.extractPageTitle(html) ?? 'Untitled',
        company: this.inferCompany(baseUrl),
        description: this.stripHtml(html).slice(0, 5000),
        sourceUrl: baseUrl,
      });
    }

    return jobs;
  }

  private extractPageTitle(html: string): string | undefined {
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match?.[1]?.trim();
  }

  private inferCompany(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '').split('.')[0] ?? 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
