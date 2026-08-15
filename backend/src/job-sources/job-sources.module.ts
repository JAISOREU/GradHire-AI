import { Module, forwardRef } from '@nestjs/common';
import { JobSourcesController } from './job-sources.controller';
import { JobSourcesService } from './job-sources.service';

@Module({
  imports: [],
  controllers: [JobSourcesController],
  providers: [JobSourcesService],
  exports: [JobSourcesService],
})
export class JobSourcesModule {}
