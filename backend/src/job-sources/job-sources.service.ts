import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJobSourceDto, UpdateJobSourceDto } from './dto/job-source.dto';
import { JobSource, JobSourceRun, JobSourceStatus, IngestionJobStatus, JobSourceParserType } from '@prisma/client';

@Injectable()
export class JobSourcesService {
  private readonly logger = new Logger(JobSourcesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<JobSource[]> {
    return this.prisma.jobSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<JobSource> {
    const source = await this.prisma.jobSource.findUnique({
      where: { id },
    });
    if (!source) {
      throw new NotFoundException('Job source not found');
    }
    return source;
  }

  async create(dto: CreateJobSourceDto): Promise<JobSource> {
    return this.prisma.jobSource.create({
      data: {
        name: dto.name,
        company: dto.company,
        sourceType: dto.sourceType,
        baseUrl: dto.baseUrl,
        feedUrl: dto.feedUrl,
        crawlInterval: dto.crawlInterval ?? 60,
        rateLimit: dto.rateLimit,
        attribution: dto.attribution,
        config: dto.config as any,
        fieldMapping: dto.fieldMapping as any,
        parserType: (dto.parserType as JobSourceParserType | undefined) ?? 'GENERIC',
        authenticationType: (dto.authenticationType as any | undefined) ?? 'NONE',
      },
    });
  }

  async update(id: string, dto: UpdateJobSourceDto): Promise<JobSource> {
    await this.findOne(id);
    return this.prisma.jobSource.update({
      where: { id },
      data: {
        name: dto.name,
        company: dto.company,
        sourceType: dto.sourceType,
        baseUrl: dto.baseUrl,
        feedUrl: dto.feedUrl,
        enabled: dto.enabled,
        crawlInterval: dto.crawlInterval,
        rateLimit: dto.rateLimit,
        attribution: dto.attribution,
        config: dto.config as any,
        fieldMapping: dto.fieldMapping as any,
        parserType: (dto.parserType as JobSourceParserType | undefined),
        authenticationType: (dto.authenticationType as any | undefined),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.jobSource.delete({ where: { id } });
  }

  async findRuns(id: string, limit = 20): Promise<JobSourceRun[]> {
    await this.findOne(id);
    const safeLimit = Number.isInteger(limit) ? limit : 20;
    return this.prisma.jobSourceRun.findMany({
      where: { sourceId: id },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  }

  async getHealth(id: string) {
    const source = await this.findOne(id);
    const recentRuns = await this.prisma.jobSourceRun.findMany({
      where: { sourceId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const successRate = recentRuns.length
      ? recentRuns.filter((r) => r.status === 'SUCCESS' || r.status === 'PARTIAL').length / recentRuns.length
      : 0;

    const healthStatus = source.healthStatus ?? 'NEVER_TESTED';
    const lastRun = source.lastRunAt ? new Date(source.lastRunAt).toISOString() : null;
    const timeSinceLastRun = lastRun ? Date.now() - new Date(lastRun).getTime() : null;

    let nextRunAt: string | null = null;
    if (lastRun) {
      const backoff = this.calculateBackoff(source);
      const interval = (source.crawlInterval ?? 60) * 60_000 + backoff * 60_000;
      nextRunAt = new Date(new Date(lastRun).getTime() + interval).toISOString();
    }

    return {
      sourceId: id,
      status: source.status,
      enabled: source.enabled,
      healthStatus,
      parserType: source.parserType,
      authenticationType: source.authenticationType,
      lastRunAt: lastRun,
      lastSuccessAt: source.lastSuccessAt ? new Date(source.lastSuccessAt).toISOString() : null,
      lastFailureAt: source.lastFailureAt ? new Date(source.lastFailureAt).toISOString() : null,
      failureCount: source.failureCount,
      lastError: source.lastError,
      recentRuns: recentRuns.length,
      successRate,
      timeSinceLastRun,
      nextRunAt,
    };
  }

  async markRunStatus(runId: string, status: IngestionJobStatus, extra?: Partial<JobSourceRun>): Promise<void> {
    const { sourceId: _sourceId, ...safeExtra } = extra ?? {};
    await this.prisma.jobSourceRun.update({
      where: { id: runId },
      data: {
        status,
        finishedAt: status === 'SUCCESS' || status === 'PARTIAL' || status === 'FAILED' ? new Date() : undefined,
        ...safeExtra,
      } as any,
    });
  }

  private calculateBackoff(source: JobSource): number {
    const failures = source.failureCount ?? 0;
    if (failures === 0) return 0;
    return Math.min(2 ** failures * 5, 480);
  }
}
