import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JobSourcesService } from '../../job-sources/job-sources.service';
import { SourceAdapter, RawJobItem } from '../adapters/source-adapter.interface';
import { ApiSourceAdapter } from '../adapters/api-source.adapter';
import { RssSourceAdapter } from '../adapters/rss-source.adapter';
import { JsonSourceAdapter } from '../adapters/json-source.adapter';
import { HtmlSourceAdapter } from '../adapters/html-source.adapter';
import { GreenhouseAdapter } from '../adapters/greenhouse.adapter';
import { LeverAdapter } from '../adapters/lever.adapter';
import { AshbyAdapter } from '../adapters/ashby.adapter';
import { SmartRecruitersAdapter } from '../adapters/smartrecruiters.adapter';
import { AdzunaAdapter } from '../adapters/adzuna.adapter';
import { UsaJobsAdapter } from '../adapters/usajobs.adapter';
import { NormalizerService } from './normalizer.service';
import { DeduplicationService } from './deduplication.service';
import { QualityService } from './quality.service';
import { Job, JobSource, JobSourceRun, JobSourceJob, ImportedJobStatus, IngestionJobStatus, JobSourceParserType, JobSourceHealthStatus } from '@prisma/client';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  private readonly adapters: Record<JobSourceParserType, SourceAdapter>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobSourcesService: JobSourcesService,
    private readonly normalizer: NormalizerService,
    private readonly dedup: DeduplicationService,
    private readonly quality: QualityService,
    apiAdapter: ApiSourceAdapter,
    rssAdapter: RssSourceAdapter,
    jsonAdapter: JsonSourceAdapter,
    htmlAdapter: HtmlSourceAdapter,
    greenhouseAdapter: GreenhouseAdapter,
    leverAdapter: LeverAdapter,
    ashbyAdapter: AshbyAdapter,
    smartRecruitersAdapter: SmartRecruitersAdapter,
    adzunaAdapter: AdzunaAdapter,
    usajobsAdapter: UsaJobsAdapter,
  ) {
    this.adapters = {
      GENERIC: apiAdapter,
      GREENHOUSE: greenhouseAdapter,
      LEVER: leverAdapter,
      ASHBY: ashbyAdapter,
      SMARTRECRUITERS: smartRecruitersAdapter,
      ADZUNA: adzunaAdapter,
      USAJOBS: usajobsAdapter,
    };
  }

  async runForSource(source: JobSource): Promise<JobSourceRun> {
    const run = await this.prisma.jobSourceRun.create({
      data: {
        sourceId: source.id,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    let discovered = 0;
    let imported = 0;
    let updated = 0;
    let duplicates = 0;
    let rejected = 0;
    const errors: Record<string, string> = {};

    try {
      const adapter = this.adapters[source.parserType ?? 'GENERIC'];
      if (!adapter) {
        throw new Error(`Unsupported parser type: ${source.parserType}`);
      }

      let rawJobs: RawJobItem[];
      try {
        rawJobs = await adapter.fetch({
          feedUrl: source.feedUrl,
          config: (source.config ?? undefined) as Record<string, unknown> | undefined,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.fetch = msg;
        throw err;
      }

      discovered = rawJobs.length;

      for (const raw of rawJobs) {
        try {
          const sourceJobId = raw.externalId;
          let fp = this.dedup.fingerprint({
            title: raw.title,
            company: raw.company,
            description: raw.description,
            applicationUrl: raw.applicationUrl,
          });

          const existing = sourceJobId
            ? await this.prisma.jobSourceJob.findFirst({
                where: { sourceId: source.id, sourceJobId },
              })
            : await this.prisma.jobSourceJob.findFirst({
                where: { sourceId: source.id, fingerprint: fp },
              });

          if (existing?.fingerprint) {
            fp = existing.fingerprint;
          }

          const normalized = await this.normalizer.normalize(source, raw);
          const quality = this.quality.validate(raw as any, normalized as any);

          if (!quality.pass) {
            rejected++;
            await this.prisma.jobSourceJob.create({
              data: {
                sourceId: source.id,
                runId: run.id,
                sourceJobId,
                fingerprint: fp,
                status: 'REJECTED',
                rejectionReason: quality.reasons.join('; '),
                rawData: raw.raw as any,
                normalizedData: normalized as any,
                applicationUrl: raw.applicationUrl,
                sourceUrl: raw.sourceUrl,
                postedAt: raw.postedAt ? new Date(raw.postedAt) : undefined,
                expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
              },
            });
            continue;
          }

          if (existing && existing.jobId) {
            const status = existing.status === 'IMPORTED' || existing.status === 'PUBLISHED' ? 'IMPORTED' : existing.status;
            await this.prisma.jobSourceJob.update({
              where: { id: existing.id },
              data: {
                runId: run.id,
                fingerprint: fp,
                status,
                rawData: raw.raw as any,
                normalizedData: normalized as any,
                applicationUrl: raw.applicationUrl,
                sourceUrl: raw.sourceUrl,
                postedAt: raw.postedAt ? new Date(raw.postedAt) : undefined,
                expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
              },
            });

            await this.prisma.job.update({
              where: { id: existing.jobId },
              data: {
                title: normalized.title,
                description: normalized.description,
                company: normalized.company,
                type: normalized.type,
                workplaceType: normalized.workplaceType,
                experienceLevel: normalized.experienceLevel,
                requiredSkills: normalized.requiredSkills,
                preferredSkills: normalized.preferredSkills,
                country: normalized.country,
                city: normalized.city,
                salaryMin: normalized.salaryMin,
                salaryMax: normalized.salaryMax,
                applicationUrl: normalized.applicationUrl,
                sourceUrl: normalized.sourceUrl,
                sourceName: source.name,
                updatedAt: new Date(),
              },
            });
            updated++;
            continue;
          }

          const systemEmployer = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true },
          });

          if (!systemEmployer) {
            errors.mapping = 'No system employer found for external job';
            rejected++;
            continue;
          }

          const job = await this.prisma.job.create({
            data: {
              employerId: systemEmployer.id,
              title: normalized.title,
              company: normalized.company,
              description: normalized.description,
              responsibilities: normalized.description,
              requiredQualifications: normalized.requiredQualifications ?? '',
              type: normalized.type,
              workplaceType: normalized.workplaceType,
              experienceLevel: normalized.experienceLevel,
              requiredSkills: normalized.requiredSkills,
              preferredSkills: normalized.preferredSkills,
              country: normalized.country,
              city: normalized.city,
              salaryMin: normalized.salaryMin,
              salaryMax: normalized.salaryMax,
              status: 'PUBLISHED',
              publishedAt: new Date(),
              isExternal: true,
              applicationUrl: normalized.applicationUrl,
              sourceName: source.name,
              sourceUrl: normalized.sourceUrl,
              sourceJobId: raw.externalId,
              importedAt: new Date(),
              acceptsFreshGraduates: normalized.acceptsFreshGraduates ?? false,
              acceptsStudents: normalized.acceptsStudents ?? false,
              noExperienceRequired: normalized.noExperienceRequired ?? false,
              internshipAccepted: normalized.internshipAccepted ?? false,
              salaryUndisclosed: !normalized.salaryMin && !normalized.salaryMax,
              currency: normalized.currency ?? 'PHP',
            } as any,
          });

          await this.prisma.jobSourceJob.create({
            data: {
              sourceId: source.id,
              runId: run.id,
              sourceJobId,
              jobId: job.id,
              fingerprint: fp,
              status: 'PUBLISHED',
              rawData: raw.raw as any,
              normalizedData: normalized as any,
              applicationUrl: raw.applicationUrl,
              sourceUrl: raw.sourceUrl,
              postedAt: raw.postedAt ? new Date(raw.postedAt) : undefined,
              expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
            },
          });

          imported++;
        } catch (err) {
          errors[raw.externalId] = err instanceof Error ? err.message : String(err);
          rejected++;
        }
      }
    } catch (err) {
      if (!errors.fetch) {
        errors.run = err instanceof Error ? err.message : String(err);
      }
    }

    const finalStatus: IngestionJobStatus = imported > 0 && (rejected > 0 || updated > 0) ? 'PARTIAL' : imported > 0 ? 'SUCCESS' : 'FAILED';

    await this.prisma.jobSourceRun.update({
      where: { id: run.id },
      data: {
        status: finalStatus,
        finishedAt: new Date(),
        discovered,
        imported,
        updated,
        duplicates,
        rejected,
        errors: Object.keys(errors).length > 0 ? (errors as any) : undefined,
        metadata: { sourceName: source.name, sourceType: source.sourceType } as any,
      },
    });

    await this.prisma.jobSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastSuccessAt: finalStatus === 'SUCCESS' || finalStatus === 'PARTIAL' ? new Date() : source.lastSuccessAt,
        lastFailureAt: finalStatus === 'FAILED' ? new Date() : source.lastFailureAt,
        failureCount: finalStatus === 'FAILED' ? source.failureCount + 1 : 0,
        lastError: finalStatus === 'FAILED' ? (errors.run ?? errors.fetch ?? 'Unknown error') : null,
        status: finalStatus === 'FAILED' ? 'ERROR' : source.status,
        healthStatus: this.computeHealthStatus(finalStatus, source),
      },
    });

    return run;
  }

  async testSource(source: JobSource): Promise<{ success: boolean; message: string; discovered: number; error?: string }> {
    try {
      const adapter = this.adapters[source.parserType ?? 'GENERIC'];
      if (!adapter) {
        return { success: false, message: `Unsupported parser type: ${source.parserType}`, discovered: 0 };
      }

      const rawJobs = await adapter.fetch({
        feedUrl: source.feedUrl,
        config: (source.config ?? undefined) as Record<string, unknown> | undefined,
      });

      await this.prisma.jobSource.update({
        where: { id: source.id },
        data: {
          lastSuccessAt: new Date(),
          lastError: null,
          failureCount: 0,
          healthStatus: 'HEALTHY',
          status: 'ACTIVE',
        },
      });

      return { success: true, message: `Discovered ${rawJobs.length} jobs`, discovered: rawJobs.length };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.prisma.jobSource.update({
        where: { id: source.id },
        data: {
          lastError: msg,
          failureCount: { increment: 1 },
          healthStatus: 'FAILING',
        },
      });
      return { success: false, message: msg, discovered: 0, error: msg };
    }
  }

  private computeHealthStatus(finalStatus: IngestionJobStatus, source: JobSource): JobSourceHealthStatus {
    if (!source.enabled) return 'DISABLED';
    if (source.lastSuccessAt && source.failureCount === 0) return 'HEALTHY';
    if (source.failureCount >= 3) return 'FAILING';
    if (finalStatus === 'PARTIAL') return 'DEGRADED';
    return 'NEVER_TESTED';
  }
}
