import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { Public } from '../common/decorators/public.decorator.js';
import { DRIZZLE } from '../database/database.constants.js';
import { type Database } from '../database/database.types.js';
import { REDIS_CLIENT } from '../integrations/redis/redis.constants.js';
import { HEALTH_CHECK_TIMEOUT_MS } from './health.constants.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Database and Redis status' })
  check() {
    return this.health.check([
      () =>
        this.indicator
          .check('database')
          .attempt(async () => {
            await this.db.execute(sql`select 1`);
          })
          .withTimeout(HEALTH_CHECK_TIMEOUT_MS),
      () =>
        this.indicator
          .check('redis')
          .attempt(async () => {
            await this.redis.ping();
          })
          .withTimeout(HEALTH_CHECK_TIMEOUT_MS),
    ]);
  }
}
