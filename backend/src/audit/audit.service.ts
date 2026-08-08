import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface AuditLogInput {
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          metadata: input.metadata as any,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to write audit log', error);
    }
  }
}
