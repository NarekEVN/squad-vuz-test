import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { type AppConfigService } from './config/config.types.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApp(app);

  const { port } = app.get<AppConfigService>(ConfigService).get('app', {
    infer: true,
  });
  await app.listen(port);
}
await bootstrap();
