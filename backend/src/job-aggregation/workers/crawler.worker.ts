import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JobAggregationService } from '../job-aggregation.service';
import { JobSourceService } from '../sources/job-source.service';

@Injectable()
export class CrawlerWorker {
  private readonly logger = new Logger(CrawlerWorker.name);
  private readonly enabled: boolean;

  constructor(
    private readonly aggregation: JobAggregationService,
    private readonly sourceService: JobSourceService,
  ) {
    this.enabled = process.env.JOB_AGGREGATION_ENABLED === 'true';
  }

  @Cron(process.env.JOB_AGGREGATION_INTERVAL || '0 */6 * * *')
  async runScheduledCrawl(): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Job aggregation disabled, skipping scheduled crawl');
      return;
    }

    this.logger.log('Starting scheduled job aggregation crawl');
    const sources = await this.sourceService.findAll();
    const enabledSources = sources.filter((s) => s.enabled && s.status === 'ACTIVE');

    for (const source of enabledSources) {
      try {
        await this.aggregation.triggerCrawl(source.id);
      } catch (error) {
        this.logger.warn(`Failed to crawl source ${source.name}: ${error}`);
      }
    }

    this.logger.log(`Scheduled crawl completed for ${enabledSources.length} sources`);
  }
}
