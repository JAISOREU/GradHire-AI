import { Module } from '@nestjs/common';
import { JobAggregationController } from './job-aggregation.controller';
import { JobAggregationService } from './job-aggregation.service';
import { JobSourceService } from './sources/job-source.service';
import { PrismaModule } from '../prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, CacheModule, AiModule],
  controllers: [JobAggregationController],
  providers: [JobAggregationService, JobSourceService],
  exports: [JobAggregationService, JobSourceService],
})
export class JobAggregationModule {}
