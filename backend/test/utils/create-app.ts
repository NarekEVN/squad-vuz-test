import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModuleBuilder } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { type App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { DRIZZLE } from '../../src/database/database.constants.js';
import { type Database } from '../../src/database/database.types.js';

export type TestApp = INestApplication<App>;

export async function createTestApp(
  override?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<TestApp> {
  const builder = Test.createTestingModule({ imports: [AppModule] });
  const moduleRef = await (override ? override(builder) : builder).compile();
  const app = moduleRef.createNestApplication<TestApp>({ bufferLogs: true });
  configureApp(app);
  await app.init();
  return app;
}

export async function truncateAll(app: TestApp): Promise<void> {
  const db = app.get<Database>(DRIZZLE);
  await db.execute(sql`truncate table users restart identity cascade`);
}
