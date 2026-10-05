import { randomUUID } from 'node:crypto';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { REQUEST_ID_HEADER } from './common/constants/http.constants.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { validationExceptionFactory } from './common/exceptions/validation.exception.js';
import { type AppConfigService } from './config/config.types.js';
import { configuration } from './config/configuration.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { RedisModule } from './integrations/redis/redis.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CharactersModule } from './modules/characters/characters.module.js';
import { SquadsModule } from './modules/squads/squads.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: [configuration],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: AppConfigService) => {
        const { env, logLevel } = config.get('app', { infer: true });
        return {
          pinoHttp: {
            level: logLevel,
            genReqId: (req, res) => {
              const incoming = req.headers[REQUEST_ID_HEADER];
              const id =
                typeof incoming === 'string' && incoming
                  ? incoming
                  : randomUUID();
              res.setHeader(REQUEST_ID_HEADER, id);
              return id;
            },
            serializers: {
              req: (req: { id: string; method: string; url: string }) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res: { statusCode: number }) => ({
                statusCode: res.statusCode,
              }),
            },
            autoLogging: {
              ignore: (req) => req.url?.endsWith('/health') ?? false,
            },
            transport:
              env === 'development'
                ? { target: 'pino-pretty', options: { singleLine: true } }
                : undefined,
          },
        };
      },
    }),
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    CharactersModule,
    SquadsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: validationExceptionFactory,
      }),
    },
  ],
})
export class AppModule {}
