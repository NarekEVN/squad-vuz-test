import { type ConfigService } from '@nestjs/config';
import { type z } from 'zod';
import { type configuration } from './configuration.js';
import { type envSchema } from './validation.js';

export type Env = z.infer<typeof envSchema>;

export type AppConfig = ReturnType<typeof configuration>;

export type AppConfigService = ConfigService<AppConfig, true>;
