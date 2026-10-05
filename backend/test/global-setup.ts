import { runMigrations } from '../src/database/migrate.js';

export default async function setup(): Promise<void> {
  process.loadEnvFile('.env.test');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing from .env.test');
  }
  await runMigrations(databaseUrl);
}
