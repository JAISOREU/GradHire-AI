import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { PipelineService } from './pipeline.service';
import { JobSource, JobSourceStatus, JobSourceHealthStatus } from '@prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private running = false;
  private readonly concurrency = 3;
  private readonly maxBackoffMinutes = 480;

  constructor(private readonly prisma: PrismaService, private readonly pipeline: PipelineService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (this.running) return;
    this.running = true;

    try {
      const sources = await this.prisma.jobSource.findMany({
        where: { enabled: true },
        orderBy: { lastRunAt: 'asc' },
      });

      const now = new Date();
      const due = sources.filter((s: JobSource) => this.isDue(s, now));
      const eligible = due.filter((s) => this.canRun(s));

      const backoffAdjusted = eligible.map((s) => ({
        source: s,
        score: this.backoffScore(s),
      }));

      backoffAdjusted.sort((a, b) => a.score - b.score);

      const batch = backoffAdjusted.slice(0, this.concurrency).map((x) => x.source);
      this.logger.log(`Scheduler tick: ${due.length} due, ${eligible.length} eligible, running ${batch.length}`);

      await Promise.allSettled(
        batch.map((source: JobSource) =>
          this.runWithLock(source).catch((err: unknown) => this.logger.warn(`Source ${source.id} failed: ${err instanceof Error ? err.message : String(err)}`)),
        ),
      );
    } finally {
      this.running = false;
    }
  }

  private isDue(source: JobSource, now: Date): boolean {
    if (source.healthStatus === 'DISABLED' || source.healthStatus === 'FAILING') {
      return false;
    }
    if (!source.lastRunAt) return true;
    const backoffMinutes = this.calculateBackoffMinutes(source);
    const next = new Date(source.lastRunAt.getTime() + (source.crawlInterval ?? 60) * 60_000 + backoffMinutes * 60_000);
    return now >= next;
  }

  private canRun(source: JobSource): boolean {
    if (!source.enabled) return false;
    if (source.status === 'ERROR') return false;
    if (source.failureCount >= 5) return false;
    return true;
  }

  private backoffScore(source: JobSource): number {
    const base = source.failureCount || 0;
    const backoff = this.calculateBackoffMinutes(source);
    return base * 100 + backoff;
  }

  private calculateBackoffMinutes(source: JobSource): number {
    const failures = source.failureCount ?? 0;
    if (failures === 0) return 0;
    return Math.min(2 ** failures * 5, this.maxBackoffMinutes);
  }

  private async runWithLock(source: JobSource): Promise<void> {
    const result = await this.prisma.$executeRaw`
      SELECT pg_try_advisory_xact_lock(hashtext(${source.id}))
    `;
    const locked = (result as unknown as number) === 1;
    if (!locked) {
      this.logger.debug(`Source ${source.id} is already running in another transaction`);
      return;
    }

    try {
      await this.pipeline.runForSource(await this.prisma.jobSource.findUnique({ where: { id: source.id } }) as JobSource);
    } catch (err: unknown) {
      this.logger.error(`Scheduler run failed for source ${source.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
