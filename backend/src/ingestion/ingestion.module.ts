import { Module } from '@nestjs/common';
import { JobSourcesModule } from '../job-sources/job-sources.module';
import { PrismaModule } from '../prisma.module';
import { AiModule } from '../ai/ai.module';
import { SchedulerService } from './services/scheduler.service';
import { PipelineService } from './services/pipeline.service';
import { NormalizerService } from './services/normalizer.service';
import { DeduplicationService } from './services/deduplication.service';
import { QualityService } from './services/quality.service';
import { ApiSourceAdapter } from './adapters/api-source.adapter';
import { RssSourceAdapter } from './adapters/rss-source.adapter';
import { JsonSourceAdapter } from './adapters/json-source.adapter';
import { HtmlSourceAdapter } from './adapters/html-source.adapter';

@Module({
  imports: [PrismaModule, JobSourcesModule, AiModule],
  controllers: [],
  providers: [
    SchedulerService,
    PipelineService,
    NormalizerService,
    DeduplicationService,
    QualityService,
    ApiSourceAdapter,
    RssSourceAdapter,
    JsonSourceAdapter,
    HtmlSourceAdapter,
  ],
  exports: [PipelineService, SchedulerService],
})
export class IngestionModule {}
