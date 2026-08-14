import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { JobSourceService } from './sources/job-source.service';
import { RssConnector, ApiConnector, CareerPageConnector } from './sources';
import { JobNormalizer } from './normalizer';
import { DuplicateDetector } from './duplicates';
import { AiExtractionService } from './ai-extraction.service';
import { SanitizationService } from './sanitization.service';
import { AggregationStatus, JobSourceType } from '@prisma/client';

export interface AggregationDashboard {
  sources: { total: number; active: number; disabled: number };
  jobs: {
    discoveredToday: number;
    importedToday: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    expired: number;
    duplicates: number;
  };
  recentCrawls: { sourceName: string; discovered: number; imported: number; status: string; createdAt: string }[];
}

@Injectable()
export class JobAggregationService {
  private readonly logger = new Logger(JobAggregationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sourceService: JobSourceService,
    private readonly normalizer: JobNormalizer,
    private readonly duplicateDetector: DuplicateDetector,
    private readonly aiExtraction: AiExtractionService,
    private readonly sanitization: SanitizationService,
    private readonly http: HttpService,
  ) {}

  async getDashboard(): Promise<AggregationDashboard> {
    const [sourcesTotal, sourcesActive, sourcesDisabled] = await Promise.all([
      this.prisma.jobSource.count(),
      this.prisma.jobSource.count({ where: { enabled: true, status: 'ACTIVE' } }),
      this.prisma.jobSource.count({ where: { enabled: false } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      discoveredToday,
      importedToday,
      pendingReview,
      approved,
      rejected,
      expired,
      duplicates,
      recentCrawls,
    ] = await Promise.all([
      this.prisma.aggregatedJob.count({ where: { aggregatedAt: { gte: today } } }),
      this.prisma.aggregatedJob.count({ where: { aggregatedAt: { gte: today }, aggregationStatus: 'AGGREGATED' } }),
      this.prisma.aggregatedJob.count({ where: { aggregationStatus: 'PENDING_REVIEW' } }),
      this.prisma.aggregatedJob.count({ where: { aggregationStatus: 'AGGREGATED' } }),
      this.prisma.aggregatedJob.count({ where: { aggregationStatus: 'REJECTED' } }),
      this.prisma.aggregatedJob.count({ where: { aggregationStatus: 'EXPIRED' } }),
      this.prisma.aggregatedJob.count({ where: { duplicateOfId: { not: null } } }),
      this.prisma.aggregatedJob.findMany({
        take: 20,
        orderBy: { aggregatedAt: 'desc' },
        select: { sourceName: true, aggregationStatus: true, aggregatedAt: true, jobId: true },
      }),
    ]);

    return {
      sources: { total: sourcesTotal, active: sourcesActive, disabled: sourcesDisabled },
      jobs: {
        discoveredToday,
        importedToday,
        pendingReview,
        approved,
        rejected,
        expired,
        duplicates,
      },
      recentCrawls: recentCrawls.map((c) => ({
        sourceName: c.sourceName,
        discovered: 0,
        imported: 0,
        status: c.aggregationStatus,
        createdAt: c.aggregatedAt.toISOString(),
      })),
    };
  }

  async listSources() {
    return this.sourceService.findAll();
  }

  async createSource(data: Record<string, unknown>) {
    return this.sourceService.create(data);
  }

  async updateSource(id: string, data: Record<string, unknown>) {
    return this.sourceService.update(id, data);
  }

  async triggerCrawl(id: string) {
    const source = await this.sourceService.findOne(id);
    if (!source) {
      throw new NotFoundException('Source not found');
    }

    this.logger.log(`Starting crawl for source: ${source.name}`);
    const connector = this.getConnector(source.sourceType);

    try {
      const rawJobs = await connector.discoverJobs({ id: source.id, baseUrl: source.baseUrl, configuration: (source.configuration as Record<string, unknown>) ?? {} });
      let discovered = rawJobs.length;
      let imported = 0;

      for (const raw of rawJobs) {
        try {
          await this.processRawJob(raw, source);
          imported++;
        } catch (error) {
          this.logger.warn(`Failed to process job from ${source.name}: ${error}`);
        }
      }

      await this.sourceService.update(id, {
        lastCrawledAt: new Date(),
        status: 'ACTIVE',
      });

      this.logger.log(`Crawl completed for ${source.name}: ${discovered} discovered, ${imported} imported`);
      return { message: 'Crawl completed', discovered, imported };
    } catch (error) {
      await this.sourceService.update(id, { status: 'ERROR' });
      this.logger.error(`Crawl failed for ${source.name}: ${error}`);
      throw new BadRequestException(`Crawl failed: ${error}`);
    }
  }

  async listAggregatedJobs(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.aggregatedJob.findMany({
        include: { job: true, source: true },
        orderBy: { aggregatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.aggregatedJob.count(),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        jobId: item.jobId,
        title: item.job.title,
        company: item.job.company,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        status: item.aggregationStatus,
        confidence: item.aggregationConfidence,
        aggregatedAt: item.aggregatedAt,
        lastVerifiedAt: item.lastVerifiedAt,
        expiresAt: item.expiresAt,
        duplicateOfId: item.duplicateOfId,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAggregatedJob(id: string) {
    const item = await this.prisma.aggregatedJob.findUnique({
      where: { id },
      include: { job: true, source: true, duplicateOf: { include: { job: true } } },
    });
    if (!item) {
      throw new NotFoundException('Aggregated job not found');
    }
    return {
      id: item.id,
      jobId: item.jobId,
      title: item.job.title,
      company: item.job.company,
      location: `${item.job.city ?? ''} ${item.job.country ?? ''}`.trim() || 'Not specified',
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      status: item.aggregationStatus,
      confidence: item.aggregationConfidence,
      aggregatedAt: item.aggregatedAt,
      lastVerifiedAt: item.lastVerifiedAt,
      expiresAt: item.expiresAt,
      duplicateOfId: item.duplicateOfId,
      duplicateOf: item.duplicateOf
        ? {
            id: item.duplicateOf.id,
            title: item.duplicateOf.job.title,
            sourceUrl: item.duplicateOf.sourceUrl,
          }
        : null,
    };
  }

  async approveJob(id: string, adminId: string) {
    const item = await this.prisma.aggregatedJob.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Aggregated job not found');

    await this.prisma.aggregatedJob.update({
      where: { id },
      data: { aggregationStatus: 'AGGREGATED' },
    });

    await this.prisma.job.update({
      where: { id: item.jobId },
      data: { status: 'PUBLISHED' },
    });

    this.logger.log(`Admin ${adminId} approved aggregated job ${id}`);
    return { message: 'Job approved and published' };
  }

  async rejectJob(id: string, adminId: string) {
    const item = await this.prisma.aggregatedJob.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Aggregated job not found');

    await this.prisma.aggregatedJob.update({
      where: { id },
      data: { aggregationStatus: 'REJECTED' },
    });

    await this.prisma.job.update({
      where: { id: item.jobId },
      data: { status: 'ARCHIVED' },
    });

    this.logger.log(`Admin ${adminId} rejected aggregated job ${id}`);
    return { message: 'Job rejected and archived' };
  }

  async retryJob(id: string) {
    const item = await this.prisma.aggregatedJob.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Aggregated job not found');

    await this.prisma.aggregatedJob.update({
      where: { id },
      data: { aggregationStatus: 'PENDING_REVIEW' },
    });

    this.logger.log(`Aggregated job ${id} queued for retry`);
    return { message: 'Job queued for reprocessing' };
  }

  async expireStaleJobs() {
    const now = new Date();
    const expired = await this.prisma.aggregatedJob.findMany({
      where: {
        OR: [
          { expiresAt: { lte: now } },
          { aggregationStatus: 'AGGREGATED', lastVerifiedAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
      include: { job: true },
    });

    for (const item of expired) {
      try {
        await this.prisma.aggregatedJob.update({
          where: { id: item.id },
          data: { aggregationStatus: 'EXPIRED' },
        });
        await this.prisma.job.update({
          where: { id: item.jobId },
          data: { status: 'EXPIRED' },
        });
        this.logger.log(`Expired aggregated job ${item.id}`);
      } catch (error) {
        this.logger.warn(`Failed to expire aggregated job ${item.id}: ${error}`);
      }
    }

    return { expired: expired.length };
  }

  private getConnector(sourceType: JobSourceType) {
    switch (sourceType) {
      case 'RSS':
        return new RssConnector(this.http);
      case 'API':
        return new ApiConnector(this.http);
      case 'CAREER_PAGE':
        return new CareerPageConnector(this.http);
      default:
        throw new BadRequestException(`Unsupported source type: ${sourceType}`);
    }
  }

  private async processRawJob(raw: any, source: any): Promise<void> {
    const sanitized = this.sanitization.sanitize(raw);

    const existing = await this.duplicateDetector.findDuplicates(
      sanitized.sourceUrl,
      sanitized.company,
      sanitized.title,
      sanitized.location ?? 'Unknown',
    );

    if (existing.length > 0) {
      this.logger.debug(`Duplicate detected for ${sanitized.title} from ${sanitized.sourceUrl}`);
      return;
    }

    const aiResult = await this.aiExtraction.extractJobData(sanitized);
    const normalized = this.normalizer.normalize({
      ...sanitized,
      ...aiResult,
    });

    const confidence = Object.values(normalized.confidence).map((c) => c.confidence);
    const avgConfidence = confidence.length > 0 ? confidence.reduce((a, b) => a + b, 0) / confidence.length : 0;

    const contentHash = this.duplicateDetector.computeContentHash(normalized.normalizedTitle, normalized.normalizedCompany, normalized.description);

    const duplicateCheck = await this.duplicateDetector.findDuplicates(
      sanitized.sourceUrl,
      normalized.normalizedCompany,
      normalized.normalizedTitle,
      normalized.normalizedLocation,
      contentHash,
    );

    if (duplicateCheck.length > 0) {
      this.logger.debug(`Duplicate detected after normalization for ${normalized.normalizedTitle}`);
      return;
    }

    const aggregationStatus: AggregationStatus = avgConfidence >= 0.9 ? 'AGGREGATED' : avgConfidence >= 0.7 ? 'PENDING_REVIEW' : 'REJECTED';

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const job = await this.prisma.job.create({
      data: {
        title: normalized.normalizedTitle,
        company: normalized.normalizedCompany,
        type: normalized.normalizedEmploymentType ? (normalized.normalizedEmploymentType as any) : 'HIRING',
        experienceLevel: normalized.normalizedExperienceLevel ? (normalized.normalizedExperienceLevel as any) : 'ENTRY_LEVEL',
        description: normalized.description,
        requiredQualifications: normalized.requirements?.join('\n') ?? '',
        responsibilities: normalized.responsibilities?.join('\n') ?? '',
        requiredSkills: normalized.skills ?? [],
        preferredSkills: [],
        status: aggregationStatus === 'AGGREGATED' ? 'PUBLISHED' : 'DRAFT',
        origin: 'AGGREGATED_EXTERNAL',
        sourceType: source.sourceType,
        sourceName: source.name,
        sourceJobId: sanitized.sourceUrl,
        sourceUrl: sanitized.sourceUrl,
        externalCompanyName: normalized.normalizedCompany,
        aggregatedAt: new Date(),
        lastVerifiedAt: new Date(),
        expiresAt,
        aggregationStatus,
        aggregationConfidence: avgConfidence,
        contentHash,
        employerId: 'system',
        workplaceType: normalized.normalizedWorkplaceType ? (normalized.normalizedWorkplaceType as any) : 'ONSITE',
        salaryMin: normalized.salaryMin,
        salaryMax: normalized.salaryMax,
        currency: normalized.salaryCurrency ?? 'PHP',
        salaryType: normalized.salaryFrequency ? (normalized.salaryFrequency as any) : 'ANNUAL',
        applicationDeadline: normalized.applicationDeadline ? new Date(normalized.applicationDeadline) : undefined,
      },
    });

    await this.prisma.aggregatedJob.create({
      data: {
        jobId: job.id,
        sourceType: source.sourceType,
        sourceName: source.name,
        sourceJobId: sanitized.sourceUrl,
        sourceUrl: sanitized.sourceUrl,
        externalCompanyName: normalized.normalizedCompany,
        aggregatedAt: new Date(),
        lastVerifiedAt: new Date(),
        expiresAt,
        aggregationStatus,
        aggregationConfidence: avgConfidence,
        contentHash,
        originalPostingDate: sanitized.originalPostingDate ? new Date(sanitized.originalPostingDate) : undefined,
      },
    });
  }
}
