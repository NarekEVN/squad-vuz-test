import { readFile } from 'node:fs/promises';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { runSeed } from '../src/database/seed.js';

const { DATABASE_URL = '', CHARACTERS_JSON_PATH = '' } = process.env;

describe('Character seed (e2e)', () => {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
  const db = drizzle({ client: pool });

  const count = async (table: string): Promise<number> => {
    const result = await db.execute<{ count: string }>(
      sql`select count(*)::text as count from ${sql.identifier(table)}`,
    );
    return Number(result.rows[0]?.count);
  };

  afterAll(async () => {
    await pool.end();
  });

  it('is idempotent: running it again creates no duplicates', async () => {
    const first = await runSeed(DATABASE_URL, CHARACTERS_JSON_PATH);
    const second = await runSeed(DATABASE_URL, CHARACTERS_JSON_PATH);

    expect(second).toEqual(first);
    expect({
      characters: await count('characters'),
      universes: await count('universes'),
      tags: await count('tags'),
      characterTags: await count('character_tags'),
      characterAbilities: await count('character_abilities'),
    }).toEqual({
      characters: 208,
      universes: 4,
      tags: 21,
      characterTags: 523,
      characterAbilities: 1040,
    });
  });

  it('never modifies the source file', async () => {
    const before = await readFile(CHARACTERS_JSON_PATH, 'utf8');
    await runSeed(DATABASE_URL, CHARACTERS_JSON_PATH);

    expect(await readFile(CHARACTERS_JSON_PATH, 'utf8')).toBe(before);
  });

  it('keeps the data quirks of the source as they are', async () => {
    const result = await db.execute<{
      id: number;
      quote: string | null;
      thumbnail: string | null;
      tag_count: number;
    }>(sql`
      select c.id, c.quote, c.thumbnail, count(ct.tag_id)::int as tag_count
      from characters c
      left join character_tags ct on ct.character_id = c.id
      where c.id in (25, 31, 42)
      group by c.id
      order by c.id
    `);

    expect(result.rows).toEqual([
      expect.objectContaining({ id: 25, quote: null }),
      expect.objectContaining({ id: 31, tag_count: 0 }),
      expect.objectContaining({ id: 42, thumbnail: null }),
    ]);
    expect(await count('tags')).toBe(21);
  });
});
