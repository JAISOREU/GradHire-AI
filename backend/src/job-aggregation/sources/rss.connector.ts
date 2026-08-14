import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JobSourceConnector, RawJobPosting } from './job-source.interface';

@Injectable()
export class RssConnector implements JobSourceConnector {
  sourceType = 'RSS';
  private readonly logger = new Logger(RssConnector.name);

  constructor(private readonly http: HttpService) {}

  async discoverJobs(source: { id: string; baseUrl: string; configuration?: Record<string, unknown> }): Promise<RawJobPosting[]> {
    const timeout = (source.configuration?.timeout as number | undefined) ?? 10000;
    const response = await firstValueFrom(
      this.http.get(source.baseUrl, { timeout, headers: { Accept: 'application/rss+xml, application/xml, text/xml' } }),
    );

    const xml = typeof response.data === 'string' ? response.data : response.data?.toString?.() ?? '';
    return this.parseRssFeed(xml, source.baseUrl);
  }

  async fetchJob(url: string): Promise<RawJobPosting> {
    const response = await firstValueFrom(this.http.get(url, { timeout: 10000 }));
    const xml = typeof response.data === 'string' ? response.data : response.data?.toString?.() ?? '';
    const items = this.parseRssFeed(xml, url);
    return items[0] ?? { title: 'Untitled', company: 'Unknown', description: '', sourceUrl: url };
  }

  private parseRssFeed(xml: string, baseUrl: string): RawJobPosting[] {
    const items: RawJobPosting[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = this.extractTag(itemXml, 'title');
      const description = this.extractTag(itemXml, 'description') ?? this.extractTag(itemXml, 'summary');
      const link = this.extractTag(itemXml, 'link');
      const company = this.extractTag(itemXml, 'company') ?? this.extractTag(itemXml, 'employer') ?? this.inferCompany(baseUrl);

      if (!title) continue;

      items.push({
        title,
        company,
        description: this.stripHtml(description ?? ''),
        requirements: this.splitList(this.extractTag(itemXml, 'requirements')),
        skills: this.splitList(this.extractTag(itemXml, 'skills')),
        employmentType: this.extractTag(itemXml, 'employmentType') ?? this.extractTag(itemXml, 'jobType'),
        workplaceType: this.extractTag(itemXml, 'workplaceType'),
        location: this.extractTag(itemXml, 'location') ?? this.extractTag(itemXml, 'city'),
        country: this.extractTag(itemXml, 'country'),
        city: this.extractTag(itemXml, 'city'),
        salaryMin: this.parseNumber(this.extractTag(itemXml, 'salaryMin')),
        salaryMax: this.parseNumber(this.extractTag(itemXml, 'salaryMax')),
        salaryCurrency: this.extractTag(itemXml, 'salaryCurrency'),
        salaryFrequency: this.extractTag(itemXml, 'salaryFrequency'),
        experienceLevel: this.extractTag(itemXml, 'experienceLevel'),
        benefits: this.splitList(this.extractTag(itemXml, 'benefits')),
        applicationDeadline: this.extractTag(itemXml, 'applicationDeadline'),
        sourceUrl: link ?? baseUrl,
        originalPostingDate: this.extractTag(itemXml, 'pubDate') ?? this.extractTag(itemXml, 'publishedAt'),
      });
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'is');
    const match = xml.match(regex);
    if (!match) return undefined;
    return match[1].trim();
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

  private splitList(value: string | undefined): string[] {
    if (!value) return [];
    return value
      .split(/[,;|]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }

  private parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed));
    return undefined;
  }
}
