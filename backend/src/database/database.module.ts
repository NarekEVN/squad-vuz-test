import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { type AppConfigService } from '../config/config.types.js';
import { DRIZZLE, PG_POOL } from './database.constants.js';
import { type Database } from './database.types.js';
import * as schema from './schema/index.js';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: AppConfigService) =>
        new Pool({
          connectionString: config.get('db', { infer: true }).url,
          max: 10,
          connectionTimeoutMillis: 5_000,
          idleTimeoutMillis: 30_000,
        }),
    },
    {
      provide: DRIZZLE,
      inject: [PG_POOL],
      useFactory: (pool: Pool): Database =>
        drizzle({ client: pool, schema, casing: 'snake_case' }),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
