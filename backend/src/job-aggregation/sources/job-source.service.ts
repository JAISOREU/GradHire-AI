import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JobSourceType } from '@prisma/client';

export interface CreateJobSourceDto {
  name: string;
  baseUrl: string;
  sourceType: JobSourceType;
  enabled?: boolean;
  crawlFrequency?: string;
  configuration?: Record<string, unknown>;
}

@Injectable()
export class JobSourceService {
  private readonly logger = new Logger(JobSourceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.jobSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const source = await this.prisma.jobSource.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException('Job source not found');
    }
    return source;
  }

  async create(data: Record<string, unknown>) {
    this.validateUrl(data.baseUrl as string);
    return this.prisma.jobSource.create({
      data: {
        name: data.name as string,
        baseUrl: data.baseUrl as string,
        sourceType: data.sourceType as JobSourceType,
        enabled: (data.enabled as boolean) ?? true,
        crawlFrequency: data.crawlFrequency as string,
        configuration: (data.configuration ?? {}) as any,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.baseUrl !== undefined) {
      this.validateUrl(data.baseUrl as string);
      updateData.baseUrl = data.baseUrl;
    }
    if (data.sourceType !== undefined) updateData.sourceType = data.sourceType;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.crawlFrequency !== undefined) updateData.crawlFrequency = data.crawlFrequency;
    if (data.configuration !== undefined) updateData.configuration = data.configuration;
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.jobSource.update({
      where: { id },
      data: updateData,
    });
  }

  private validateUrl(url: string) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new BadRequestException('Only HTTP/HTTPS URLs are allowed');
      }
      if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
        throw new BadRequestException('Localhost URLs are not allowed');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid URL');
    }
  }
}
