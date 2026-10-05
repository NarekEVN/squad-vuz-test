import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { API_PREFIX, DOCS_PATH } from './app.constants.js';
import { type AppConfigService } from './config/config.types.js';
import { RedisIoAdapter } from './integrations/redis/redis-io.adapter.js';
import { SOCKET_IO_CHANNEL_PREFIX } from './integrations/redis/redis.constants.js';

export function configureApp(app: INestApplication): void {
  const config = app.get<AppConfigService>(ConfigService);
  const { corsOrigins, env } = config.get('app', { infer: true });
  const { url: redisUrl } = config.get('redis', { infer: true });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.enableShutdownHooks();
  app.useWebSocketAdapter(
    new RedisIoAdapter(
      app,
      redisUrl,
      corsOrigins,
      `${SOCKET_IO_CHANNEL_PREFIX}:${env}`,
    ),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Squad of Champions API')
      .setDescription(
        'Characters, filtering and squads for the 360 VUZ fullstack challenge.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup(DOCS_PATH, app, document, {
    jsonDocumentUrl: `${DOCS_PATH}-json`,
  });
}
