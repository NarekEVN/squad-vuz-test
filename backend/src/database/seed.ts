import { readFile } from 'node:fs/promises';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { cacheVersionKey } from '../integrations/redis/cache-keys.js';
import { CacheScope } from '../integrations/redis/redis.constants.js';
import * as schema from './schema/index.js';
import { sourceCharactersSchema } from './seeders/character-source.schema.js';
import { seedCharacters } from './seeders/characters.seeder.js';
import { type SeedSummary } from './database.types.js';

export async function runSeed(
  databaseUrl: string,
  charactersJsonPath: string,
): Promise<SeedSummary> {
  const raw: unknown = JSON.parse(await readFile(charactersJsonPath, 'utf8'));
  const source = sourceCharactersSchema.parse(raw);
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    return await seedCharacters(
      drizzle({ client: pool, schema, casing: 'snake_case' }),
      source,
    );
  } finally {
    await pool.end();
  }
}

export async function invalidateCharacterCache(
  redisUrl: string,
): Promise<number> {
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
  try {
    return await redis.incr(cacheVersionKey(CacheScope.Characters));
  } finally {
    redis.disconnect();
  }
}

if (import.meta.main) {
  const { DATABASE_URL, CHARACTERS_JSON_PATH, REDIS_URL } = process.env;
  if (!DATABASE_URL || !CHARACTERS_JSON_PATH || !REDIS_URL) {
    console.error(
      'DATABASE_URL, CHARACTERS_JSON_PATH and REDIS_URL must be set',
    );
    process.exit(1);
  }
  console.log(`Seeding characters from ${CHARACTERS_JSON_PATH}...`);
  const summary = await runSeed(DATABASE_URL, CHARACTERS_JSON_PATH);
  console.log('Seed complete', summary);
  const version = await invalidateCharacterCache(REDIS_URL);
  console.log(`Character cache invalidated (version ${version})`);
}
