import { runMigrations } from '../src/database/migrate.js';
import { invalidateCharacterCache, runSeed } from '../src/database/seed.js';

export default async function setup(): Promise<void> {
  process.loadEnvFile('.env.test');
  const { DATABASE_URL, CHARACTERS_JSON_PATH, REDIS_URL } = process.env;
  if (!DATABASE_URL || !CHARACTERS_JSON_PATH || !REDIS_URL) {
    throw new Error(
      'DATABASE_URL, CHARACTERS_JSON_PATH and REDIS_URL must be set in .env.test',
    );
  }
  await runMigrations(DATABASE_URL);
  await runSeed(DATABASE_URL, CHARACTERS_JSON_PATH);
  await invalidateCharacterCache(REDIS_URL);
}
