import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { API_PREFIX, DOCS_PATH } from './app.constants.js';
import { type AppConfigService } from './config/config.types.js';

export function configureApp(app: INestApplication): void {
  const config = app.get<AppConfigService>(ConfigService);
  const { corsOrigins } = config.get('app', { infer: true });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.enableShutdownHooks();

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
