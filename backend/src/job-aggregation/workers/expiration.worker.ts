import { Injectable, Logger } from '@nestjs/common';
import { JobAggregationService } from '../job-aggregation.service';

@Injectable()
export class ExpirationWorker {
  private readonly logger = new Logger(ExpirationWorker.name);
  private readonly enabled: boolean;

  constructor(private readonly aggregation: JobAggregationService) {
    this.enabled = process.env.JOB_AGGREGATION_ENABLED === 'true';
  }

  async runScheduledExpiration(): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Job aggregation disabled, skipping expiration check');
      return;
    }

    this.logger.log('Starting scheduled job expiration check');
    await this.aggregation.expireStaleJobs();
    this.logger.log('Expiration check completed');
  }
}
