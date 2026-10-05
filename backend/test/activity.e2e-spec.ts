import request from 'supertest';
import { MONGO_DB } from '../src/integrations/mongo/mongo.constants.js';
import { registerUser } from './utils/auth.util.js';
import {
  createTestApp,
  type TestApp,
  truncateAll,
} from './utils/create-app.js';
import {
  type PickStatsBody,
  type SquadBody,
  type SquadHistoryBody,
} from './utils/test.types.js';
import { waitFor } from './utils/wait.util.js';

describe('Activity log (e2e)', () => {
  let app: TestApp;

  const as = (token: string) => {
    const server = app.getHttpServer();
    const auth = (req: request.Test) =>
      req.set('Authorization', `Bearer ${token}`);
    return {
      create: (body: object) =>
        auth(request(server).post('/api/v1/squads').send(body)).expect(201),
      update: (id: string, body: object) =>
        auth(request(server).patch(`/api/v1/squads/${id}`).send(body)).expect(
          200,
        ),
      remove: (id: string) =>
        auth(request(server).delete(`/api/v1/squads/${id}`)).expect(204),
      add: (id: string, characterId: number) =>
        auth(
          request(server).post(
            `/api/v1/squads/${id}/characters/${characterId}`,
          ),
        ).expect(201),
      drop: (id: string, characterId: number) =>
        auth(
          request(server).delete(
            `/api/v1/squads/${id}/characters/${characterId}`,
          ),
        ).expect(200),
      history: (id: string, query: Record<string, unknown> = {}) =>
        auth(request(server).get(`/api/v1/squads/${id}/history`).query(query)),
      stats: (query: Record<string, unknown> = {}) =>
        auth(request(server).get('/api/v1/activity/stats/picks').query(query)),
    };
  };

  const historyOf = async (
    api: ReturnType<typeof as>,
    squadId: string,
    expectedCount: number,
  ) =>
    waitFor(
      async () =>
        (await api.history(squadId, { limit: 100 }).expect(200))
          .body as SquadHistoryBody,
      (body) => body.items.length >= expectedCount,
    );

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await truncateAll(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('records the full timeline of a squad, newest first, with name snapshots', async () => {
    const ryu = as(await registerUser(app, 'ryu@example.com'));
    const squad = (await ryu.create({ name: 'Alpha', characterIds: [1, 2] }))
      .body as SquadBody;
    await ryu.add(squad.id, 3);
    await ryu.drop(squad.id, 1);
    await ryu.update(squad.id, { name: 'Beta', characterIds: [2, 4] });
    await ryu.remove(squad.id);

    const history = await historyOf(ryu, squad.id, 9);

    expect(
      history.items
        .map((e) => [e.type, e.squadName, e.character?.id ?? null])
        .reverse(),
    ).toEqual([
      ['created', 'Alpha', null],
      ['member-added', 'Alpha', 1],
      ['member-added', 'Alpha', 2],
      ['member-added', 'Alpha', 3],
      ['member-removed', 'Alpha', 1],
      ['updated', 'Beta', null],
      ['member-removed', 'Beta', 3],
      ['member-added', 'Beta', 4],
      ['deleted', 'Beta', null],
    ]);
    const added = history.items.find((e) => e.character?.id === 3);
    expect(added?.character).toEqual({
      id: 3,
      name: expect.any(String),
      thumbnail: expect.stringMatching(/^https:\/\//),
    });
  });

  it("returns an empty history for another user's squad", async () => {
    const ryu = as(await registerUser(app, 'ryu@example.com'));
    const ken = as(await registerUser(app, 'ken@example.com'));
    const squad = (await ryu.create({ name: 'Private', characterIds: [1] }))
      .body as SquadBody;
    await historyOf(ryu, squad.id, 2);

    const res = await ken.history(squad.id).expect(200);

    expect(res.body).toEqual({ items: [], nextCursor: null });
  });

  it('pages through the history with a cursor without gaps or repeats', async () => {
    const ryu = as(await registerUser(app, 'ryu@example.com'));
    const squad = (await ryu.create({ name: 'Pages' })).body as SquadBody;
    for (const id of [1, 2, 3, 4]) {
      await ryu.add(squad.id, id);
    }
    const all = await historyOf(ryu, squad.id, 5);

    const ids: string[] = [];
    let cursor: string | null = null;
    do {
      const page = (
        await ryu
          .history(squad.id, { limit: 2, ...(cursor ? { cursor } : {}) })
          .expect(200)
      ).body as SquadHistoryBody;
      ids.push(...page.items.map((e) => e.id));
      cursor = page.nextCursor;
    } while (cursor);

    expect(ids).toEqual(all.items.map((e) => e.id));
  });

  it('aggregates pick statistics across all users', async () => {
    const ryu = as(await registerUser(app, 'ryu@example.com'));
    const ken = as(await registerUser(app, 'ken@example.com'));
    const a = (await ryu.create({ name: 'A', characterIds: [10, 11] }))
      .body as SquadBody;
    const b = (await ken.create({ name: 'B', characterIds: [10] }))
      .body as SquadBody;
    await ken.add(b.id, 12);
    await ryu.drop(a.id, 11);

    const stats = await waitFor(
      async () => (await ryu.stats().expect(200)).body as PickStatsBody,
      (body) => body.totals.added + body.totals.removed >= 5,
    );

    expect(stats.totals).toEqual({ added: 4, removed: 1 });
    expect(
      stats.characters.map((c) => [c.characterId, c.added, c.removed, c.net]),
    ).toEqual([
      [10, 2, 0, 2],
      [12, 1, 0, 1],
      [11, 1, 1, 0],
    ]);
    expect(stats.daily).toEqual([
      { date: new Date().toISOString().slice(0, 10), added: 4, removed: 1 },
    ]);
  });

  it.each([
    ['history', { cursor: 'nope' }, 'INVALID_CURSOR'],
    ['history', { limit: 0 }, 'VALIDATION_FAILED'],
    ['stats', { days: 0 }, 'VALIDATION_FAILED'],
    ['stats', { days: 366 }, 'VALIDATION_FAILED'],
  ] as const)('rejects invalid %s query %o', async (endpoint, query, code) => {
    const ryu = as(await registerUser(app, 'ryu@example.com'));
    const req =
      endpoint === 'history'
        ? ryu.history('00000000-0000-4000-8000-000000000000', query)
        : ryu.stats(query);

    const res = await req.expect(400);

    expect(res.body.error).toBe(code);
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/activity/stats/picks')
      .expect(401);
  });
});

describe('Activity log when MongoDB is down (e2e)', () => {
  let app: TestApp;

  beforeAll(async () => {
    const unavailable = () =>
      Promise.reject(
        new Error('MongoServerSelectionError: connection refused'),
      );
    const collection = {
      createIndexes: unavailable,
      insertOne: unavailable,
    };
    app = await createTestApp((builder) =>
      builder.overrideProvider(MONGO_DB).useValue({
        collection: () => collection,
        command: unavailable,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps squad changes working', async () => {
    const token = await registerUser(app, 'mongo-down@example.com');

    const res = await request(app.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Resilient', characterIds: [1, 2] })
      .expect(201);

    expect((res.body as SquadBody).members).toHaveLength(2);
  });

  it('reports MongoDB as degraded while the API stays healthy', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body.status).toBe('degraded');
    expect(res.body.info.database.status).toBe('up');
    expect(res.body.info.redis.status).toBe('up');
    expect(res.body.details.mongo.status).toBe('degraded');
  });
});
