import { createHash } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { type AppConfigService } from '../../config/config.types.js';
import { cacheVersionKey } from './cache-keys.js';
import { REDIS_CLIENT } from './redis.constants.js';
import { type CacheResult, type CacheScope } from './redis.types.js';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly ttlSeconds: number;
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(ConfigService) config: AppConfigService,
  ) {
    this.ttlSeconds = config.get('redis', { infer: true }).cacheTtlSeconds;
  }

  static hashKey(parts: unknown): string {
    return createHash('sha1').update(JSON.stringify(parts)).digest('base64url');
  }

  async getOrSet<T>(
    scope: CacheScope,
    key: string,
    loader: () => Promise<T>,
  ): Promise<CacheResult<T>> {
    let fullKey: string;
    try {
      const version = (await this.redis.get(cacheVersionKey(scope))) ?? '0';
      fullKey = `cache:${scope}:v${version}:${key}`;
      const cached = await this.redis.get(fullKey);
      if (cached !== null) {
        return { value: JSON.parse(cached) as T, status: 'HIT' };
      }
    } catch (error) {
      this.logger.warn(`Cache unavailable, reading through: ${String(error)}`);
      return { value: await loader(), status: 'BYPASS' };
    }

    const value = await this.loadOnce(fullKey, loader);
    await this.redis
      .set(fullKey, JSON.stringify(value), 'EX', this.ttlSeconds)
      .catch((error: unknown) => {
        this.logger.warn(`Cache write failed: ${String(error)}`);
      });
    return { value, status: 'MISS' };
  }

  async invalidate(scope: CacheScope): Promise<void> {
    await this.redis.incr(cacheVersionKey(scope));
  }

  private loadOnce<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const pending = this.inflight.get(key) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }
    const promise = loader().finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    return promise;
  }
}
