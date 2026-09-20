import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CacheService } from '../cache/cache.service';
import { STORAGE_SERVICE } from '../storage/storage.module';
import { IStorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';
import { NotificationsGateway } from '../websockets/notifications.gateway';
import { Inject } from '@nestjs/common';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: { status: 'up' | 'down'; latencyMs?: number };
    redis: { status: 'up' | 'down' | 'disabled'; latencyMs?: number };
    storage: { status: 'up' | 'down' | 'disabled'; provider: string };
    email: { status: 'up' | 'down' | 'disabled'; provider?: string };
    ai: { status: 'up' | 'down' | 'disabled'; latencyMs?: number };
    websockets: { status: 'up' | 'down' | 'disabled' };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
    private readonly email: EmailService,
    private readonly ai: AiService,
    private readonly wsGateway: NotificationsGateway,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {
      database: { status: 'down' },
      redis: { status: 'disabled' },
      storage: { status: 'disabled', provider: 'unknown' },
      email: { status: 'disabled' },
      ai: { status: 'disabled' },
      websockets: { status: 'disabled' },
    };

    // Database (required)
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database.latencyMs = Date.now() - start;
      checks.database.status = 'up';
    } catch (error) {
      this.logger.warn('Health check: database is unreachable');
    }

    // Redis (optional - cache/rate-limit)
    try {
      const start = Date.now();
      const ping = await this.cache.ping();
      checks.redis.latencyMs = Date.now() - start;
      if (ping === null) {
        checks.redis.status = 'disabled';
      } else {
        checks.redis.status = ping ? 'up' : 'down';
      }
    } catch (error) {
      this.logger.warn('Health check: redis check failed', error);
      checks.redis.status = 'down';
    }

    // Storage (required for file uploads)
    try {
      const provider = process.env.STORAGE_PROVIDER ?? 'local';
      checks.storage.provider = provider;
      checks.storage.status = 'up';
    } catch {
      checks.storage.status = 'down';
    }

    // Email (optional - notifications work without it)
    try {
      const configured = this.email.isConfigured();
      checks.email.status = configured ? 'up' : 'disabled';
      checks.email.provider = configured ? 'resend' : undefined;
    } catch {
      checks.email.status = 'down';
    }

    // recommendation service (optional - falls back to heuristics)
    try {
      const start = Date.now();
      const healthy = await this.ai.healthCheck();
      checks.ai.latencyMs = Date.now() - start;
      checks.ai.status = healthy ? 'up' : 'down';
    } catch {
      checks.ai.status = 'down';
    }

    // WebSockets (required for real-time notifications)
    try {
      const server = this.wsGateway.getServer();
      checks.websockets.status = server ? 'up' : 'down';
    } catch {
      checks.websockets.status = 'down';
    }

    const requiredDown = checks.database.status === 'down' || checks.storage.status === 'down' || checks.websockets.status === 'down';
    const optionalDown = checks.redis.status === 'down' || checks.email.status === 'down' || checks.ai.status === 'down';

    const status: HealthCheckResult['status'] = requiredDown ? 'unhealthy' : optionalDown ? 'degraded' : 'healthy';

    return {
      status,
      service: 'gradture-backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
