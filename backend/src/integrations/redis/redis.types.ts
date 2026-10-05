import { type CacheScope as CacheScopes } from './redis.constants.js';

export type CacheScope = (typeof CacheScopes)[keyof typeof CacheScopes];

export type CacheStatus = 'HIT' | 'MISS' | 'BYPASS';

export interface CacheResult<T> {
  value: T;
  status: CacheStatus;
}
