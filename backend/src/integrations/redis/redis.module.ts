import {
  Global,
  Inject,
  Logger,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { type AppConfigService } from '../../config/configuration.js';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: AppConfigService) => {
        const logger = new Logger('Redis');
        const client = new Redis(config.get('redis', { infer: true }).url, {
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          lazyConnect: true,
        });
        client.on('error', (error: Error) => {
          logger.warn(`Redis error: ${error.message}`);
        });
        try {
          await client.connect();
        } catch (error) {
          logger.warn(
            `Redis unavailable at startup: ${(error as Error).message}`,
          );
        }
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
