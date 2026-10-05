import { readFile } from 'node:fs/promises';
import request from 'supertest';
import { ABILITY_NAMES } from '../src/database/database.constants.js';
import { type SourceCharacter } from '../src/database/database.types.js';
import { sourceCharactersSchema } from '../src/database/seeders/character-source.schema.js';
import { CacheService } from '../src/integrations/redis/cache.service.js';
import {
  CacheScope,
  REDIS_CLIENT,
} from '../src/integrations/redis/redis.constants.js';
import { createTestApp, type TestApp } from './utils/create-app.js';
import {
  type CharacterBody,
  type CharacterListBody,
} from './utils/test.types.js';

describe('Characters (e2e)', () => {
  let app: TestApp;
  let source: SourceCharacter[];

  const get = (path: string, query: Record<string, unknown> = {}) =>
    request(app.getHttpServer()).get(`/api/v1${path}`).query(query);

  const list = async (query: Record<string, unknown> = {}) =>
    (await get('/characters', query).expect(200)).body as CharacterListBody;

  const walkAllPages = async (query: Record<string, unknown>) => {
    const items: CharacterBody[] = [];
    let cursor: string | null = null;
    let pages = 0;
    do {
      const body = await list({ ...query, ...(cursor ? { cursor } : {}) });
      items.push(...body.items);
      cursor = body.nextCursor;
      pages += 1;
    } while (cursor);
    return { items, pages };
  };

  const idsWhere = (predicate: (c: SourceCharacter) => boolean) =>
    source
      .filter(predicate)
      .map((c) => c.id)
      .sort((a, b) => a - b);

  const sourceById = (id: number): SourceCharacter => {
    const character = source.find((c) => c.id === id);
    if (!character) {
      throw new Error(`Character ${id} is missing from the source`);
    }
    return character;
  };

  const tagNames = (c: SourceCharacter) =>
    (c.tags ?? []).map((t) => t.tag_name);

  beforeAll(async () => {
    source = sourceCharactersSchema.parse(
      JSON.parse(
        await readFile(process.env.CHARACTERS_JSON_PATH ?? '', 'utf8'),
      ),
    );
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /characters pagination', () => {
    it('returns the first page with the total and a cursor', async () => {
      const body = await list();

      expect(body.items).toHaveLength(20);
      expect(body.total).toBe(208);
      expect(body.nextCursor).toEqual(expect.any(String));
    });

    it.each([
      ['name', 'asc'],
      ['name', 'desc'],
      ['id', 'asc'],
      ['id', 'desc'],
    ])(
      'walks every character exactly once sorted by %s %s',
      async (sort, order) => {
        const { items, pages } = await walkAllPages({ sort, order, limit: 50 });

        expect(pages).toBe(5);
        expect(new Set(items.map((c) => c.id)).size).toBe(208);
        expect(items.map((c) => c.id).sort((a, b) => a - b)).toEqual(
          source.map((c) => c.id).sort((a, b) => a - b),
        );
      },
    );

    it('orders by id exactly', async () => {
      const asc = await walkAllPages({ sort: 'id', limit: 50 });
      const desc = await walkAllPages({ sort: 'id', order: 'desc', limit: 50 });

      const ascending = Array.from({ length: 208 }, (_, i) => i + 1);
      expect(asc.items.map((c) => c.id)).toEqual(ascending);
      expect(desc.items.map((c) => c.id)).toEqual(ascending.reverse());
    });

    it('orders by name consistently across page boundaries', async () => {
      const paged = await walkAllPages({ limit: 7 });
      const single = await list({ limit: 50 });

      expect(paged.items.slice(0, 50).map((c) => c.id)).toEqual(
        single.items.map((c) => c.id),
      );
    });

    it('rejects a cursor reused with a different sort', async () => {
      const { nextCursor } = await list({ sort: 'name' });

      const res = await get('/characters', {
        sort: 'id',
        cursor: nextCursor,
      }).expect(400);

      expect(res.body.error).toBe('INVALID_CURSOR');
    });

    it('rejects a malformed cursor', async () => {
      const res = await get('/characters', { cursor: 'not-a-cursor' }).expect(
        400,
      );

      expect(res.body.error).toBe('INVALID_CURSOR');
    });

    it.each([
      [{ limit: 0 }],
      [{ limit: 51 }],
      [{ limit: 'ten' }],
      [{ sort: 'power' }],
      [{ order: 'up' }],
      [{ tagMatch: 'some' }],
      [{ unknown: 'x' }],
    ])('rejects invalid query %o with VALIDATION_FAILED', async (query) => {
      const res = await get('/characters', query).expect(400);

      expect(res.body.error).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /characters filters', () => {
    it('filters by universe', async () => {
      const { items } = await walkAllPages({
        universe: 'Dragon Ball Z',
        limit: 50,
      });

      expect(items.map((c) => c.id).sort((a, b) => a - b)).toEqual(
        idsWhere((c) => c.universe === 'Dragon Ball Z'),
      );
    });

    it('filters by several universes', async () => {
      const body = await list({ universe: 'Street Fighter,Mortal Kombat' });

      expect(body.total).toBe(
        idsWhere((c) =>
          ['Street Fighter', 'Mortal Kombat'].includes(c.universe),
        ).length,
      );
    });

    it('matches any of several tags by default', async () => {
      const { items } = await walkAllPages({ tags: 'alien,strong', limit: 50 });

      expect(items.map((c) => c.id).sort((a, b) => a - b)).toEqual(
        idsWhere((c) =>
          tagNames(c).some((t) => t === 'alien' || t === 'strong'),
        ),
      );
    });

    it('matches all tags with tagMatch=all, given as repeated params', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/characters?tags=alien&tags=strong&tagMatch=all&limit=50')
        .expect(200);

      expect(
        (res.body as CharacterListBody).items
          .map((c) => c.id)
          .sort((a, b) => a - b),
      ).toEqual(
        idsWhere(
          (c) =>
            tagNames(c).includes('alien') && tagNames(c).includes('strong'),
        ),
      );
    });

    it('combines search, universe and tags', async () => {
      const body = await list({
        search: 'a',
        universe: 'Super Smash Bros',
        tags: 'aerial',
        limit: 50,
      });

      expect(body.items.map((c) => c.id).sort((a, b) => a - b)).toEqual(
        idsWhere(
          (c) =>
            c.name.toLowerCase().includes('a') &&
            c.universe === 'Super Smash Bros' &&
            tagNames(c).includes('aerial'),
        ),
      );
    });

    it('searches names case-insensitively', async () => {
      const body = await list({ search: '  GOKU ', limit: 50 });

      expect(body.items.map((c) => c.id).sort((a, b) => a - b)).toEqual(
        idsWhere((c) => c.name.toLowerCase().includes('goku')),
      );
      expect(body.total).toBeGreaterThan(0);
    });

    it.each(['%', '_', '\\'])(
      'treats %s in a search as a literal character',
      async (term) => {
        const body = await list({ search: term });

        expect(body.total).toBe(idsWhere((c) => c.name.includes(term)).length);
      },
    );

    it('returns an empty page for unknown filter values', async () => {
      const body = await list({ tags: 'does-not-exist' });

      expect(body).toEqual({ items: [], nextCursor: null, total: 0 });
    });
  });

  describe('GET /characters/:id', () => {
    it('returns the full character in the API shape', async () => {
      const res = await get('/characters/208').expect(200);
      const original = sourceById(208);

      expect(res.body).toEqual({
        id: 208,
        name: original.name,
        quote: original.quote,
        image: original.image,
        thumbnail: original.thumbnail,
        universe: original.universe,
        tags: tagNames(original),
        abilities: ABILITY_NAMES.map((name) => ({
          name,
          score: original.abilities.find((a) => a.abilityName === name)
            ?.abilityScore,
        })),
      });
    });

    it('handles the source quirks', async () => {
      const robocop = (await get('/characters/25').expect(200))
        .body as CharacterBody;
      const skarlet = (await get('/characters/31').expect(200))
        .body as CharacterBody;
      const android21 = (await get('/characters/42').expect(200))
        .body as CharacterBody;

      expect(robocop.quote).toBeNull();
      expect(skarlet.tags).toEqual([]);
      expect(android21.thumbnail).toBe(android21.image);
    });

    it('returns 404 CHARACTER_NOT_FOUND for an unknown id', async () => {
      const res = await get('/characters/9999').expect(404);

      expect(res.body).toEqual({
        statusCode: 404,
        error: 'CHARACTER_NOT_FOUND',
        message: 'Character 9999 does not exist',
      });
    });

    it('returns 400 INVALID_ID for a non-numeric id', async () => {
      const res = await get('/characters/abc').expect(400);

      expect(res.body.error).toBe('INVALID_ID');
    });
  });

  describe('GET /characters/filters', () => {
    it('lists universes and tags with counts from the data', async () => {
      const res = await get('/characters/filters').expect(200);

      const universeCounts = new Map<string, number>();
      const tagCounts = new Map<string, number>();
      for (const c of source) {
        universeCounts.set(
          c.universe,
          (universeCounts.get(c.universe) ?? 0) + 1,
        );
        for (const t of tagNames(c)) {
          tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
        }
      }
      const asOptions = (counts: Map<string, number>) =>
        [...counts]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => (a.name < b.name ? -1 : 1));

      expect(res.body).toEqual({
        universes: asOptions(universeCounts),
        tags: asOptions(tagCounts),
        abilities: ABILITY_NAMES,
        sortFields: ['name', 'id'],
      });
    });
  });

  describe('caching', () => {
    it('serves an identical request from Redis', async () => {
      await app.get(CacheService).invalidate(CacheScope.Characters);

      const first = await get('/characters', { search: 'ken' }).expect(200);
      const second = await get('/characters', { search: 'ken' }).expect(200);

      expect(first.headers['x-cache']).toBe('MISS');
      expect(second.headers['x-cache']).toBe('HIT');
      expect(second.body).toEqual(first.body);
    });

    it('treats differently ordered filter values as the same request', async () => {
      await app.get(CacheService).invalidate(CacheScope.Characters);

      await get('/characters', { tags: 'ninja,human' }).expect(200);
      const reordered = await get('/characters', { tags: 'human, ninja' });

      expect(reordered.headers['x-cache']).toBe('HIT');
    });

    it('misses again after the cache version is bumped', async () => {
      await get('/characters/filters').expect(200);
      await app.get(CacheService).invalidate(CacheScope.Characters);

      const res = await get('/characters/filters').expect(200);

      expect(res.headers['x-cache']).toBe('MISS');
    });
  });
});

describe('Characters when Redis is down (e2e)', () => {
  let app: TestApp;

  beforeAll(async () => {
    const failing = () => Promise.reject(new Error('connection refused'));
    app = await createTestApp((builder) =>
      builder.overrideProvider(REDIS_CLIENT).useValue({
        get: failing,
        set: failing,
        incr: failing,
        ping: failing,
        quit: () => Promise.resolve('OK'),
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('still serves characters straight from Postgres', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/characters')
      .expect(200);

    expect(res.headers['x-cache']).toBe('BYPASS');
    expect((res.body as CharacterListBody).total).toBe(208);
  });
});
