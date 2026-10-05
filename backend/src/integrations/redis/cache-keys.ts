import { type CacheScope } from './redis.types.js';

export function cacheVersionKey(scope: CacheScope): string {
  return `cache:${scope}:version`;
}
