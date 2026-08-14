import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface DuplicateMatch {
  existingJobId: string;
  existingSourceUrl: string;
  score: number;
  reason: string;
}

@Injectable()
export class DuplicateDetector {
  private readonly logger = new Logger(DuplicateDetector.name);

  constructor(private readonly prisma: PrismaService) {}

  async findDuplicates(
    sourceUrl: string,
    company: string,
    title: string,
    location: string,
    contentHash?: string,
  ): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];

    const existing = await this.prisma.aggregatedJob.findMany({
      where: {
        OR: [
          { sourceUrl },
          ...(contentHash ? [{ contentHash }] : []),
        ],
      },
      include: { job: true },
      take: 5,
    });

    for (const item of existing) {
      if (item.sourceUrl === sourceUrl) {
        matches.push({
          existingJobId: item.jobId,
          existingSourceUrl: item.sourceUrl,
          score: 1.0,
          reason: 'Exact source URL match',
        });
        continue;
      }

      const normalizedCompany = (item.job.company ?? '').toLowerCase();
      const normalizedTitle = (item.job.title ?? '').toLowerCase();
      const normalizedLocation = `${item.job.city ?? ''} ${item.job.country ?? ''}`.toLowerCase();

      let score = 0;
      if (normalizedCompany && company.toLowerCase().includes(normalizedCompany)) score += 0.4;
      if (normalizedTitle && title.toLowerCase().includes(normalizedTitle)) score += 0.4;
      if (normalizedLocation && location.toLowerCase().includes(normalizedLocation)) score += 0.2;

      if (score >= 0.7) {
        matches.push({
          existingJobId: item.jobId,
          existingSourceUrl: item.sourceUrl,
          score,
          reason: `High similarity (${Math.round(score * 100)}%)`,
        });
      }
    }

    return matches;
  }

  computeContentHash(title: string, company: string, description: string): string {
    const normalized = `${title.toLowerCase()}|${company.toLowerCase()}|${description.toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
