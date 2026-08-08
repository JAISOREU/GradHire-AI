import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis | null = null;
  private readonly enabled: boolean;

  constructor() {
    const url = process.env.REDIS_URL;
    this.enabled = Boolean(url);
    if (this.enabled && url) {
      this.client = new Redis(url);
      this.logger.log('Redis cache enabled');
    } else {
      this.logger.warn('Redis cache disabled — REDIS_URL not set');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) return null;
    const value = await this.client.get(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    if (!this.enabled || !this.client) return;
    await this.client.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    if (!this.enabled || !this.client) return;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}
