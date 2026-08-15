import { Module, forwardRef } from '@nestjs/common';
import { JobSourcesController } from './job-sources.controller';
import { JobSourcesService } from './job-sources.service';
import { AuthModule } from '../auth/auth.module';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [AuthModule, forwardRef(() => IngestionModule)],
  controllers: [JobSourcesController],
  providers: [JobSourcesService],
  exports: [JobSourcesService],
})
export class JobSourcesModule {}
