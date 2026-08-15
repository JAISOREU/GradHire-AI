import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(private readonly prisma: PrismaService) {}

  fingerprint(raw: { title: string; company: string; description: string; applicationUrl: string }): string {
    const content = `${raw.title.toLowerCase().trim()}|${raw.company.toLowerCase().trim()}|${raw.description.toLowerCase().trim()}|${raw.applicationUrl.toLowerCase().trim()}`;
    return this.simpleHash(content);
  }

  async findExisting(sourceId: string, fingerprint: string) {
    return this.prisma.jobSourceJob.findFirst({
      where: {
        sourceId,
        fingerprint,
      },
      orderBy: { importedAt: 'desc' },
    });
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
