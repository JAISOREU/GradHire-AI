import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
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
import { GreenhouseAdapter } from './adapters/greenhouse.adapter';
import { LeverAdapter } from './adapters/lever.adapter';
import { AshbyAdapter } from './adapters/ashby.adapter';
import { SmartRecruitersAdapter } from './adapters/smartrecruiters.adapter';
import { AdzunaAdapter } from './adapters/adzuna.adapter';
import { UsaJobsAdapter } from './adapters/usajobs.adapter';

export const PIPELINE_SERVICE = 'PIPELINE_SERVICE';

@Module({
  imports: [PrismaModule, forwardRef(() => JobSourcesModule), AiModule, HttpModule],
  controllers: [],
  providers: [
    SchedulerService,
    PipelineService,
    { provide: PIPELINE_SERVICE, useExisting: PipelineService },
    NormalizerService,
    DeduplicationService,
    QualityService,
    ApiSourceAdapter,
    RssSourceAdapter,
    JsonSourceAdapter,
    HtmlSourceAdapter,
    GreenhouseAdapter,
    LeverAdapter,
    AshbyAdapter,
    SmartRecruitersAdapter,
    AdzunaAdapter,
    UsaJobsAdapter,
  ],
  exports: [PipelineService, SchedulerService, { provide: PIPELINE_SERVICE, useExisting: PipelineService }],
})
export class IngestionModule {}
