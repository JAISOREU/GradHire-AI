import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class HtmlSourceAdapter implements SourceAdapter {
  readonly sourceType = 'HTML';
  private readonly logger = new Logger(HtmlSourceAdapter.name);

  async fetch(source: { feedUrl: string; config?: Record<string, unknown>; rateLimit?: number }): Promise<RawJobItem[]> {
    this.logger.debug(`Fetching HTML source: ${source.feedUrl}`);
    const response = await fetch(source.feedUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const selectors = (source.config as any)?.selectors ?? {};
    const itemSelector = selectors.item ?? '.job';
    const titleSelector = selectors.title ?? 'h2, .title';
    const companySelector = selectors.company ?? '.company';
    const descriptionSelector = selectors.description ?? '.description, p';
    const linkSelector = selectors.link ?? 'a';
    const locationSelector = selectors.location ?? '.location';
    const postedSelector = selectors.postedAt ?? '.date, time';

    const items: RawJobItem[] = [];
    $(itemSelector).each((_idx: number, el: any) => {
      const $el = $(el);
      const linkEl = $el.find(linkSelector).first();
      const href = linkEl.attr('href') ?? '#';
      const title = $el.find(titleSelector).first().text().trim();
      const company = $el.find(companySelector).first().text().trim();
      const description = $el.find(descriptionSelector).first().text().trim();
      const location = $el.find(locationSelector).first().text().trim();
      const postedText = $el.find(postedSelector).first().text().trim();

      if (!title) return;

      const idSeed = `${source.feedUrl}|${title}|${company || ''}|${description || ''}`;
      items.push({
        externalId: this.simpleHash(idSeed),
        title: title || 'Untitled',
        company: company || 'Unknown',
        description: description || '',
        location: location || undefined,
        postedAt: postedText ? this.toDate(postedText) : undefined,
        applicationUrl: href.startsWith('http') ? href : new URL(href, source.feedUrl).href,
        sourceUrl: source.feedUrl,
        raw: { html: $el.html() ?? '' },
      });
    });

    return items;
  }

  private toDate(value: string): Date {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
