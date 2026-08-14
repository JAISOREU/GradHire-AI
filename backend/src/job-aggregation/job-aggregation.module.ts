import { Module } from '@nestjs/common';
import { JobAggregationController } from './job-aggregation.controller';
import { JobAggregationService } from './job-aggregation.service';
import { JobSourceService } from './sources/job-source.service';
import { RssConnector } from './sources/rss.connector';
import { ApiConnector } from './sources/api.connector';
import { CareerPageConnector } from './sources/career-page.connector';
import { JobNormalizer } from './normalizer';
import { DuplicateDetector } from './duplicates';
import { AiExtractionService } from './ai-extraction.service';
import { SanitizationService } from './sanitization.service';
import { CrawlerWorker } from './workers/crawler.worker';
import { ExpirationWorker } from './workers/expiration.worker';
import { PrismaModule } from '../prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, CacheModule, AiModule],
  controllers: [JobAggregationController],
  providers: [
    JobAggregationService,
    JobSourceService,
    RssConnector,
    ApiConnector,
    CareerPageConnector,
    JobNormalizer,
    DuplicateDetector,
    AiExtractionService,
    SanitizationService,
    CrawlerWorker,
    ExpirationWorker,
  ],
  exports: [JobAggregationService, JobSourceService],
})
export class JobAggregationModule {}
