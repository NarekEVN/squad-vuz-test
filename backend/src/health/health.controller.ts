import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { type Db } from 'mongodb';
import { Public } from '../common/decorators/public.decorator.js';
import { DRIZZLE } from '../database/database.constants.js';
import { type Database } from '../database/database.types.js';
import { MONGO_DB } from '../integrations/mongo/mongo.constants.js';
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
    @Inject(MONGO_DB) private readonly mongo: Db,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Database, Redis and MongoDB status',
    description:
      'Postgres and Redis are required (down → 503). MongoDB only backs the activity log, so when it is unreachable it is reported as degraded and the API stays healthy (200).',
  })
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
      () => this.checkMongo(),
    ]);
  }

  private async checkMongo() {
    const session = this.indicator.check('mongo');
    try {
      await this.mongo.command(
        { ping: 1 },
        { timeoutMS: HEALTH_CHECK_TIMEOUT_MS },
      );
      return session.up();
    } catch (error) {
      return session.degraded({ message: String(error) });
    }
  }
}
