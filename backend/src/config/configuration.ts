import { validateEnv } from './validation.js';

export function configuration() {
  const env = validateEnv(process.env);

  return {
    app: {
      env: env.NODE_ENV,
      port: env.PORT,
      corsOrigins: env.FRONTEND_URL,
      logLevel: env.LOG_LEVEL,
    },
    db: {
      url: env.DATABASE_URL,
    },
    redis: {
      url: env.REDIS_URL,
      cacheTtlSeconds: env.CACHE_TTL_SECONDS,
    },
    mongo: {
      url: env.MONGO_URL,
    },
    auth: {
      jwtSecret: env.JWT_SECRET,
      jwtExpiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
    },
    seed: {
      charactersJsonPath: env.CHARACTERS_JSON_PATH,
    },
  };
}
