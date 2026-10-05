import { readFile } from 'node:fs/promises';
import request from 'supertest';
import { ABILITY_NAMES } from '../src/database/database.constants.js';
import { type SourceCharacter } from '../src/database/database.types.js';
import { sourceCharactersSchema } from '../src/database/seeders/character-source.schema.js';
import { registerUser } from './utils/auth.util.js';
import {
  createTestApp,
  type TestApp,
  truncateAll,
} from './utils/create-app.js';
import { type SquadBody, type SquadSummaryBody } from './utils/test.types.js';

const UNKNOWN_SQUAD_ID = '00000000-0000-4000-8000-000000000000';

describe('Squads (e2e)', () => {
  let app: TestApp;
  let source: SourceCharacter[];
  let token: string;

  const api = (authToken = token) => {
    const server = app.getHttpServer();
    const auth = (req: request.Test) =>
      req.set('Authorization', `Bearer ${authToken}`);
    return {
      list: () => auth(request(server).get('/api/v1/squads')),
      create: (body: object) =>
        auth(request(server).post('/api/v1/squads').send(body)),
      get: (id: string) => auth(request(server).get(`/api/v1/squads/${id}`)),
      update: (id: string, body: object) =>
        auth(request(server).patch(`/api/v1/squads/${id}`).send(body)),
      remove: (id: string) =>
        auth(request(server).delete(`/api/v1/squads/${id}`)),
      add: (id: string, characterId: number | string) =>
        auth(
          request(server).post(
            `/api/v1/squads/${id}/characters/${characterId}`,
          ),
        ),
      drop: (id: string, characterId: number) =>
        auth(
          request(server).delete(
            `/api/v1/squads/${id}/characters/${characterId}`,
          ),
        ),
    };
  };

  const createSquad = async (name: string, characterIds: number[] = []) =>
    (await api().create({ name, characterIds }).expect(201)).body as SquadBody;

  const memberIds = (squad: SquadBody) =>
    squad.members.map((member) => member.character.id);

  beforeAll(async () => {
    source = sourceCharactersSchema.parse(
      JSON.parse(
        await readFile(process.env.CHARACTERS_JSON_PATH ?? '', 'utf8'),
      ),
    );
    app = await createTestApp();
  });

  beforeEach(async () => {
    await truncateAll(app);
    token = await registerUser(app, 'ryu@example.com');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication and ownership', () => {
    it('requires a token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/squads')
        .expect(401);

      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it("hides another user's squad behind SQUAD_NOT_FOUND", async () => {
      const squad = await createSquad('Mine', [1]);
      const other = api(await registerUser(app, 'ken@example.com'));

      for (const res of [
        await other.get(squad.id),
        await other.update(squad.id, { name: 'Stolen' }),
        await other.add(squad.id, 2),
        await other.drop(squad.id, 1),
        await other.remove(squad.id),
      ]) {
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('SQUAD_NOT_FOUND');
      }
      expect((await other.list().expect(200)).body).toEqual([]);
      expect(memberIds((await api().get(squad.id).expect(200)).body)).toEqual([
        1,
      ]);
    });

    it('rejects a malformed squad id with INVALID_ID', async () => {
      const res = await api().get('not-a-uuid').expect(400);

      expect(res.body.error).toBe('INVALID_ID');
    });
  });

  describe('create, read, update, delete', () => {
    it('creates an empty squad with empty stats', async () => {
      const squad = await createSquad('Empty');

      expect(squad.members).toEqual([]);
      expect(squad.stats.memberCount).toBe(0);
      expect(squad.stats.overallAverage).toBeNull();
    });

    it('creates a squad with members in the given order and server-side stats', async () => {
      const squad = await createSquad('Trio', [208, 1, 42]);

      expect(squad.members.map((m) => [m.position, m.character.id])).toEqual([
        [1, 208],
        [2, 1],
        [3, 42],
      ]);

      const chosen = source.filter((c) => [208, 1, 42].includes(c.id));
      for (const stat of squad.stats.abilities) {
        const scores = chosen.map(
          (c) =>
            c.abilities.find((a) => a.abilityName === stat.name)
              ?.abilityScore ?? 0,
        );
        const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        expect(stat.average).toBeCloseTo(average, 2);
        expect(stat.min).toBe(Math.min(...scores));
        expect(stat.max).toBe(Math.max(...scores));
      }
      expect(squad.stats.abilities.map((a) => a.name)).toEqual([
        ...ABILITY_NAMES,
      ]);
    });

    it('rejects more than six characters with SQUAD_FULL and saves nothing', async () => {
      const res = await api()
        .create({ name: 'Too many', characterIds: [1, 2, 3, 4, 5, 6, 7] })
        .expect(422);

      expect(res.body).toEqual({
        statusCode: 422,
        error: 'SQUAD_FULL',
        message: 'A squad cannot have more than 6 characters',
      });
      expect((await api().list().expect(200)).body).toEqual([]);
    });

    it('rejects a repeated character with CHARACTER_ALREADY_IN_SQUAD', async () => {
      const res = await api()
        .create({ name: 'Twins', characterIds: [1, 2, 1] })
        .expect(409);

      expect(res.body.error).toBe('CHARACTER_ALREADY_IN_SQUAD');
    });

    it('rejects unknown character ids with UNKNOWN_CHARACTERS', async () => {
      const res = await api()
        .create({ name: 'Ghosts', characterIds: [1, 9998, 9999] })
        .expect(422);

      expect(res.body.error).toBe('UNKNOWN_CHARACTERS');
      expect(res.body.details).toEqual({ characterIds: [9998, 9999] });
      expect((await api().list().expect(200)).body).toEqual([]);
    });

    it.each([
      [{}],
      [{ name: '   ' }],
      [{ name: 'x'.repeat(51) }],
      [{ name: 'Ok', characterIds: ['1'] }],
      [{ name: 'Ok', characterIds: [0] }],
      [{ name: 'Ok', extra: true }],
    ])('rejects invalid body %o with VALIDATION_FAILED', async (body) => {
      const res = await api().create(body).expect(400);

      expect(res.body.error).toBe('VALIDATION_FAILED');
    });

    it('keeps names unique per user, ignoring case', async () => {
      await createSquad('Saiyan Pride');

      const res = await api().create({ name: 'saiyan pride' }).expect(409);
      expect(res.body.error).toBe('SQUAD_NAME_TAKEN');

      const other = api(await registerUser(app, 'ken@example.com'));
      await other.create({ name: 'Saiyan Pride' }).expect(201);
    });

    it('limits a user to 20 squads', async () => {
      for (let i = 1; i <= 20; i += 1) {
        await createSquad(`Squad ${i}`);
      }

      const res = await api().create({ name: 'Squad 21' }).expect(422);
      expect(res.body.error).toBe('SQUAD_LIMIT_REACHED');
    });

    it('lists squads in creation order with member counts', async () => {
      await createSquad('First', [1, 2]);
      await createSquad('Second');

      const res = await api().list().expect(200);

      expect(
        (res.body as SquadSummaryBody[]).map((s) => [s.name, s.memberCount]),
      ).toEqual([
        ['First', 2],
        ['Second', 0],
      ]);
    });

    it('renames and replaces members with PATCH', async () => {
      const squad = await createSquad('Old', [1, 2, 3]);

      const res = await api()
        .update(squad.id, { name: 'New', characterIds: [4, 5] })
        .expect(200);

      expect(res.body.name).toBe('New');
      expect(memberIds(res.body as SquadBody)).toEqual([4, 5]);
      expect((res.body as SquadBody).members.map((m) => m.position)).toEqual([
        1, 2,
      ]);
    });

    it('allows changing only the case of its own name', async () => {
      const squad = await createSquad('saiyan pride');

      await api().update(squad.id, { name: 'Saiyan Pride' }).expect(200);
    });

    it("rejects renaming to another squad's name", async () => {
      await createSquad('Taken');
      const squad = await createSquad('Mine');

      const res = await api().update(squad.id, { name: 'TAKEN' }).expect(409);
      expect(res.body.error).toBe('SQUAD_NAME_TAKEN');
    });

    it('applies the member rules to PATCH and leaves the squad unchanged on failure', async () => {
      const squad = await createSquad('Keep', [1, 2]);

      await api()
        .update(squad.id, { characterIds: [1, 2, 3, 4, 5, 6, 7] })
        .expect(422);
      await api()
        .update(squad.id, { characterIds: [3, 9999] })
        .expect(422);

      expect(memberIds((await api().get(squad.id).expect(200)).body)).toEqual([
        1, 2,
      ]);
    });

    it('deletes a squad', async () => {
      const squad = await createSquad('Gone', [1]);

      await api().remove(squad.id).expect(204);

      const res = await api().get(squad.id).expect(404);
      expect(res.body.error).toBe('SQUAD_NOT_FOUND');
    });

    it('returns SQUAD_NOT_FOUND for an unknown id', async () => {
      await api().get(UNKNOWN_SQUAD_ID).expect(404);
      await api().remove(UNKNOWN_SQUAD_ID).expect(404);
    });
  });

  describe('adding and removing characters', () => {
    it('adds a character to the first free slot and updates the squad', async () => {
      const squad = await createSquad('Grow', [1, 2, 3]);
      await api().drop(squad.id, 2).expect(200);

      const res = await api().add(squad.id, 10).expect(201);
      const updated = res.body as SquadBody;

      expect(updated.members.map((m) => [m.position, m.character.id])).toEqual([
        [1, 1],
        [2, 10],
        [3, 3],
      ]);
      expect(updated.stats.memberCount).toBe(3);
      expect(updated.updatedAt > squad.updatedAt).toBe(true);
    });

    it('rejects the seventh character with SQUAD_FULL', async () => {
      const squad = await createSquad('Full', [1, 2, 3, 4, 5, 6]);

      const res = await api().add(squad.id, 7).expect(422);

      expect(res.body.error).toBe('SQUAD_FULL');
    });

    it('rejects a character already in the squad', async () => {
      const squad = await createSquad('Dupe', [1]);

      const res = await api().add(squad.id, 1).expect(409);

      expect(res.body.error).toBe('CHARACTER_ALREADY_IN_SQUAD');
    });

    it('rejects an unknown character with CHARACTER_NOT_FOUND', async () => {
      const squad = await createSquad('Nobody');

      const res = await api().add(squad.id, 9999).expect(404);
      expect(res.body.error).toBe('CHARACTER_NOT_FOUND');

      await api().add(squad.id, 'abc').expect(400);
    });

    it('removes a character and returns the updated squad', async () => {
      const squad = await createSquad('Shrink', [1, 2]);

      const res = await api().drop(squad.id, 1).expect(200);

      expect(memberIds(res.body as SquadBody)).toEqual([2]);
    });

    it('rejects removing a character that is not in the squad', async () => {
      const squad = await createSquad('Absent', [1]);

      const res = await api().drop(squad.id, 2).expect(404);

      expect(res.body.error).toBe('CHARACTER_NOT_IN_SQUAD');
    });
  });

  describe('concurrency', () => {
    it('never exceeds six members when adds race on an almost full squad', async () => {
      const squad = await createSquad('Race', [1, 2, 3, 4, 5]);

      const results = await Promise.all(
        [10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((id) =>
          api().add(squad.id, id),
        ),
      );

      const statuses = results.map((r) => r.status);
      expect(statuses.filter((s) => s === 201)).toHaveLength(1);
      expect(statuses.filter((s) => s === 422)).toHaveLength(9);
      const final = (await api().get(squad.id).expect(200)).body as SquadBody;
      expect(final.members).toHaveLength(6);
    });

    it('fills an empty squad with exactly six of ten racing adds, one per slot', async () => {
      const squad = await createSquad('Stampede');

      const results = await Promise.all(
        Array.from({ length: 10 }, (_, i) => api().add(squad.id, i + 1)),
      );

      expect(results.filter((r) => r.status === 201)).toHaveLength(6);
      const final = (await api().get(squad.id).expect(200)).body as SquadBody;
      expect(final.members.map((m) => m.position)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(new Set(memberIds(final)).size).toBe(6);
    });

    it('adds the same character only once when requests race', async () => {
      const squad = await createSquad('Echo');

      const results = await Promise.all(
        Array.from({ length: 5 }, () => api().add(squad.id, 1)),
      );

      expect(results.map((r) => r.status).sort()).toEqual([
        201, 409, 409, 409, 409,
      ]);
    });

    it('creates only one of two racing squads with the same name', async () => {
      const results = await Promise.all([
        api().create({ name: 'Twin' }),
        api().create({ name: 'twin' }),
      ]);

      expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    });
  });
});
