import { Injectable, Logger } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import * as https from 'https';
import * as http from 'http';
import { SourceAdapter, RawJobItem } from './source-adapter.interface';

@Injectable()
export class RssSourceAdapter implements SourceAdapter {
  readonly sourceType = 'RSS';
  private readonly logger = new Logger(RssSourceAdapter.name);

  async fetch(source: { feedUrl: string; config?: Record<string, unknown>; rateLimit?: number }): Promise<RawJobItem[]> {
    this.logger.debug(`Fetching RSS source: ${source.feedUrl}`);
    const xml = await this.httpGet(source.feedUrl);
    const parsed = await parseStringPromise(xml, { explicitArray: false });

    const channel = parsed.rss?.channel ?? parsed.feed;
    if (!channel) {
      return [];
    }

    let items = Array.isArray(channel.item) ? channel.item : channel.items ? [channel.items] : [];
    if (!Array.isArray(items) && Array.isArray(channel.entry)) {
      items = channel.entry;
    }
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item: any) => {
      const guid = item.guid ?? item.id ?? `${Date.now()}-${Math.random()}`;
      const link = item.link ?? item['job:applyUrl'] ?? '#';
      return {
        externalId: String(guid),
        title: String(item.title ?? 'Untitled'),
        company: String(item['job:company'] ?? item.company ?? 'Unknown'),
        description: String(item.description ?? item.summary ?? ''),
        location: item.location ? String(item.location) : undefined,
        type: item['job:type'] ? String(item['job:type']) : undefined,
        workplaceType: item['job:workplaceType'] ? String(item['job:workplaceType']) : undefined,
        salaryMin: item['job:salaryMin'] ? Number(item['job:salaryMin']) : null,
        salaryMax: item['job:salaryMax'] ? Number(item['job:salaryMax']) : null,
        skills: item['job:skills'] ? String(item['job:skills']).split(',').map((s) => s.trim()) : [],
        postedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        expiresAt: item['job:expiresAt'] ? new Date(item['job:expiresAt']) : undefined,
        applicationUrl: String(link),
        sourceUrl: String(link ?? source.feedUrl),
        raw: item,
      };
    });
  }

  private httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          this.httpGet(res.headers.location).then(resolve, reject);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      });
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }
}
