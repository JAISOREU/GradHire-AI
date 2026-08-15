import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { PipelineService } from './pipeline.service';
import { JobSource, JobSourceStatus } from '@prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private running = false;
  private readonly concurrency = 3;

  constructor(private readonly prisma: PrismaService, private readonly pipeline: PipelineService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (this.running) return;
    this.running = true;

    try {
      const sources = await this.prisma.jobSource.findMany({
        where: { enabled: true, status: 'ACTIVE' },
        orderBy: { lastRunAt: 'asc' as any },
      });

      const now = new Date();
      const due = sources.filter((s: JobSource) => {
        if (!s.lastRunAt) return true;
        const next = new Date(s.lastRunAt.getTime() + (s.crawlInterval ?? 60) * 60_000);
        return now >= next;
      });

      const batch = due.slice(0, this.concurrency);
      this.logger.log(`Scheduler tick: ${due.length} due, running ${batch.length}`);

      await Promise.allSettled(
        batch.map((source: JobSource) => this.pipeline.runForSource(source).catch((err) => this.logger.warn(`Source ${source.id} failed: ${err.message}`))),
      );
    } finally {
      this.running = false;
    }
  }
}
