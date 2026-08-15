import { Module, forwardRef } from '@nestjs/common';
import { JobSourcesController } from './job-sources.controller';
import { JobSourcesService } from './job-sources.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JobSourcesController],
  providers: [JobSourcesService],
  exports: [JobSourcesService],
})
export class JobSourcesModule {}
