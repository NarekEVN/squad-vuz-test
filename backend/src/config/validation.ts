import { z } from 'zod';
import { type Env } from './config.types.js';

const commaSeparatedList = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).min(1));

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: commaSeparatedList.default(['http://localhost:3001']),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),

  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(3600),

  MONGO_URL: z.url({ protocol: /^mongodb(\+srv)?$/ }).optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(3600),

  CHARACTERS_JSON_PATH: z.string().optional(),
});

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
