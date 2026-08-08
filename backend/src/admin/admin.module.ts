import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdminController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AdminModule {}
