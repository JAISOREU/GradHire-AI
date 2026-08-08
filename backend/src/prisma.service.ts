import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch {
      // Do not block app startup when PostgreSQL is unavailable.
      // AppService detects this and falls back to in-memory storage.
      this.logger.warn('PostgreSQL connection failed — continuing with in-memory fallback');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined);
  }
}
