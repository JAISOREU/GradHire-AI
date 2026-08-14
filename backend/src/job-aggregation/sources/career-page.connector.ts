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
    this.logger.warn(`Career page discovery not yet implemented for source ${source.id}`);
    return [];
  }

  async fetchJob(url: string): Promise<RawJobPosting> {
    const response = await firstValueFrom(this.http.get(url, { timeout: 10000 }));
    const html = response.data;
    return this.parseCareerPage(html, url);
  }

  private parseCareerPage(_html: string, url: string): RawJobPosting {
    return {
      title: 'Untitled',
      company: 'Unknown',
      description: '',
      sourceUrl: url,
    };
  }
}
