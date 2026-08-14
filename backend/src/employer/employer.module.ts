import { Module } from '@nestjs/common';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [AuthModule, CacheModule],
  controllers: [EmployerController],
  providers: [EmployerService],
})
export class EmployerModule {}