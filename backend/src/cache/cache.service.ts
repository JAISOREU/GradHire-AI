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
      const password = process.env.REDIS_PASSWORD;
      const options: Record<string, unknown> = {};
      if (password) {
        options.password = password;
      }
      this.client = new Redis(url, options);
      this.client.on('error', (err) => this.logger.error('Redis connection error', err));
      this.client.on('connect', () => this.logger.log('Redis connected'));
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
    const keys: string[] = [];
    let cursor = '0';
    do {
      const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async ping(): Promise<boolean> {
    if (!this.enabled || !this.client) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
