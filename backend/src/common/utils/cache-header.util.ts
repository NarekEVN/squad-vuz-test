import { type Response } from 'express';
import { type CacheResult } from '../../integrations/redis/redis.types.js';
import { CACHE_STATUS_HEADER } from '../constants/http.constants.js';

export function withCacheHeader<T>(res: Response, result: CacheResult<T>): T {
  res.setHeader(CACHE_STATUS_HEADER, result.status);
  return result.value;
}
