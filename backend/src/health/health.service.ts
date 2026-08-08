import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: { status: 'up' | 'down'; latencyMs?: number };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const databaseStatus: HealthCheckResult['checks']['database'] = { status: 'down' };

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus.latencyMs = Date.now() - start;
      databaseStatus.status = 'up';
    } catch (error) {
      this.logger.warn('Health check: database is unreachable');
    }

    const allUp = databaseStatus.status === 'up';
    return {
      status: allUp ? 'healthy' : 'degraded',
      service: 'gradture-backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      checks: { database: databaseStatus },
    };
  }
}
