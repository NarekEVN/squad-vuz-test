import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { MIGRATIONS_FOLDER } from './database.constants.js';

export async function runMigrations(databaseUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    await migrate(drizzle({ client: pool }), {
      migrationsFolder: MIGRATIONS_FOLDER,
    });
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  console.log('Running database migrations...');
  await runMigrations(databaseUrl);
  console.log('Migrations complete');
}
