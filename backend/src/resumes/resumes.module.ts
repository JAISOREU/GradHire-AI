import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [ResumesController],
  providers: [ResumesService, PrismaService],
  exports: [ResumesService],
})
export class ResumesModule {}
