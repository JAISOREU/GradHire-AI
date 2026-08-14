import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JobSourceConnector } from './job-source.interface';

@Injectable()
export class ApiConnector implements JobSourceConnector {
  sourceType = 'API';
  private readonly logger = new Logger(ApiConnector.name);

  constructor(private readonly http: HttpService) {}

  async discoverJobs(source: { id: string; baseUrl: string; configuration?: Record<string, unknown> }): Promise<any[]> {
    this.logger.warn(`API discovery not yet implemented for source ${source.id}`);
    return [];
  }

  async fetchJob(url: string): Promise<any> {
    const response = await firstValueFrom(this.http.get(url, { timeout: 10000 }));
    return response.data;
  }
}
