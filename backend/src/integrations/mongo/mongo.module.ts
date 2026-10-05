import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Db, MongoClient } from 'mongodb';
import { type AppConfigService } from '../../config/config.types.js';
import {
  MONGO_CLIENT,
  MONGO_DB,
  MONGO_SERVER_SELECTION_TIMEOUT_MS,
} from './mongo.constants.js';

@Global()
@Module({
  providers: [
    {
      provide: MONGO_CLIENT,
      inject: [ConfigService],
      useFactory: (config: AppConfigService) =>
        new MongoClient(config.get('mongo', { infer: true }).url, {
          serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
        }),
    },
    {
      provide: MONGO_DB,
      inject: [MONGO_CLIENT],
      useFactory: (client: MongoClient): Db => client.db(),
    },
  ],
  exports: [MONGO_CLIENT, MONGO_DB],
})
export class MongoModule implements OnApplicationShutdown {
  constructor(@Inject(MONGO_CLIENT) private readonly client: MongoClient) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client.close();
  }
}
