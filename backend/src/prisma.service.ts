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
      this.logger.log('Connected to PostgreSQL');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`PostgreSQL connection failed: ${message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`PostgreSQL connection failed: ${message}`);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined);
  }

  async syncJobCompany(jobId: string, companyId?: string | null): Promise<void> {
    if (!companyId) return;
    const company = await this.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });
    if (company) {
      await this.job.update({
        where: { id: jobId },
        data: { company: company.name },
      });
    }
  }
}
