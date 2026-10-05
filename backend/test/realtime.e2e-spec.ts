import request from 'supertest';
import { type Socket } from 'socket.io-client';
import { registerUser } from './utils/auth.util.js';
import {
  createTestApp,
  type TestApp,
  truncateAll,
} from './utils/create-app.js';
import {
  collectEvents,
  connectSocket,
  connectWithSnapshot,
  listen,
  nextEvent,
} from './utils/socket.util.js';
import {
  type PopularityBody,
  type SquadBody,
  type SquadChangedBody,
} from './utils/test.types.js';

const POPULARITY_WINDOW_MS = 1500;

describe('Realtime (e2e)', () => {
  let app: TestApp;
  let secondInstance: TestApp;
  let baseUrl: string;
  let secondBaseUrl: string;
  const sockets: Socket[] = [];

  const open = async (url: string, token?: string) => {
    const socket = await connectSocket(url, token);
    sockets.push(socket);
    return socket;
  };

  const createSquad = async (token: string, name: string) =>
    (
      await request(app.getHttpServer())
        .post('/api/v1/squads')
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(201)
    ).body as SquadBody;

  const addMember = (
    server: TestApp,
    token: string,
    squadId: string,
    characterId: number,
  ) =>
    request(server.getHttpServer())
      .post(`/api/v1/squads/${squadId}/characters/${characterId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

  beforeAll(async () => {
    app = await createTestApp();
    secondInstance = await createTestApp();
    baseUrl = await listen(app);
    secondBaseUrl = await listen(secondInstance);
  });

  beforeEach(async () => {
    await truncateAll(app);
  });

  afterEach(() => {
    sockets.splice(0).forEach((socket) => socket.close());
  });

  afterAll(async () => {
    await app.close();
    await secondInstance.close();
  });

  describe('authentication', () => {
    it('rejects a connection without a token', async () => {
      await expect(connectSocket(baseUrl)).rejects.toMatchObject({
        message: 'Missing or invalid access token',
        data: { error: 'UNAUTHORIZED' },
      });
    });

    it('rejects a connection with an invalid token', async () => {
      await expect(connectSocket(baseUrl, 'not-a-jwt')).rejects.toMatchObject({
        data: { error: 'UNAUTHORIZED' },
      });
    });

    it('sends the current popularity right after connecting', async () => {
      const token = await registerUser(app, 'ryu@example.com');
      const squad = await createSquad(token, 'Pick');
      await addMember(app, token, squad.id, 7);

      const { socket, snapshot } = await connectWithSnapshot(baseUrl, token);
      sockets.push(socket);

      expect(snapshot.characters).toEqual([
        expect.objectContaining({ characterId: 7, picks: 1 }),
      ]);
    });
  });

  describe('squad sync', () => {
    it('notifies every session of the same user, and only that user', async () => {
      const ryu = await registerUser(app, 'ryu@example.com');
      const ken = await registerUser(app, 'ken@example.com');
      const squad = await createSquad(ryu, 'Sync');
      const [firstTab, secondTab, otherUser] = await Promise.all([
        open(baseUrl, ryu),
        open(baseUrl, ryu),
        open(baseUrl, ken),
      ]);

      const otherUserEvents = collectEvents<SquadChangedBody>(
        otherUser,
        'squad:changed',
        1000,
      );
      const [first, second] = await Promise.all([
        nextEvent<SquadChangedBody>(firstTab, 'squad:changed'),
        nextEvent<SquadChangedBody>(secondTab, 'squad:changed'),
        addMember(app, ryu, squad.id, 1),
      ]);

      const expected = {
        squadId: squad.id,
        reason: 'member-added',
        characterId: 1,
      };
      expect(first).toEqual(expected);
      expect(second).toEqual(expected);
      expect(await otherUserEvents).toEqual([]);
    });

    it('reaches a session connected to another API instance through Redis', async () => {
      const ryu = await registerUser(app, 'ryu@example.com');
      const squad = await createSquad(ryu, 'Cluster');
      const remoteTab = await open(secondBaseUrl, ryu);

      const [event] = await Promise.all([
        nextEvent<SquadChangedBody>(remoteTab, 'squad:changed'),
        addMember(app, ryu, squad.id, 3),
      ]);

      expect(event).toMatchObject({
        squadId: squad.id,
        reason: 'member-added',
      });
    });
  });

  describe('live popularity', () => {
    it('broadcasts updated picks to every user, debounced into one message', async () => {
      const ryu = await registerUser(app, 'ryu@example.com');
      const ken = await registerUser(app, 'ken@example.com');
      const squad = await createSquad(ryu, 'Burst');
      const { socket: watcher } = await connectWithSnapshot(baseUrl, ken);
      sockets.push(watcher);

      const broadcasts = collectEvents<PopularityBody>(
        watcher,
        'popularity:updated',
        POPULARITY_WINDOW_MS,
      );
      for (const id of [10, 11, 12]) {
        await addMember(app, ryu, squad.id, id);
      }

      const received = await broadcasts;
      expect(received).toHaveLength(1);
      expect(
        received[0]?.characters.map((c) => [c.characterId, c.picks]).sort(),
      ).toEqual([
        [10, 1],
        [11, 1],
        [12, 1],
      ]);
    });
  });
});
