import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import {
  createTestApp,
  type TestApp,
  truncateAll,
} from './utils/create-app.js';

const credentials = { email: 'ryu@example.com', password: 'hadouken123' };

describe('Auth (e2e)', () => {
  let app: TestApp;

  const register = (body: object) =>
    request(app.getHttpServer()).post('/api/v1/auth/register').send(body);
  const login = (body: object) =>
    request(app.getHttpServer()).post('/api/v1/auth/login').send(body);
  const me = (token?: string) => {
    const req = request(app.getHttpServer()).get('/api/v1/auth/me');
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await truncateAll(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('creates the account and returns a token and profile', async () => {
      const res = await register(credentials).expect(201);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: 900,
        user: {
          id: expect.stringMatching(/^[0-9a-f-]{36}$/),
          email: 'ryu@example.com',
          createdAt: expect.any(String),
        },
      });
    });

    it('normalizes the email to lowercase', async () => {
      const res = await register({
        ...credentials,
        email: '  Ryu@Example.COM ',
      }).expect(201);

      expect(res.body.user.email).toBe('ryu@example.com');
    });

    it('rejects a duplicate email regardless of case with 409 EMAIL_TAKEN', async () => {
      await register(credentials).expect(201);

      const res = await register({
        ...credentials,
        email: 'RYU@example.com',
      }).expect(409);

      expect(res.body).toEqual({
        statusCode: 409,
        error: 'EMAIL_TAKEN',
        message: 'An account with this email already exists',
      });
    });

    it('lets only one of two concurrent registrations succeed', async () => {
      const results = await Promise.all([
        register(credentials),
        register(credentials),
      ]);

      expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    });

    it('rejects invalid input with 400 VALIDATION_FAILED and field details', async () => {
      const res = await register({
        email: 'not-an-email',
        password: 'short',
      }).expect(400);

      expect(res.body.error).toBe('VALIDATION_FAILED');
      expect(
        (res.body.details as { field: string }[]).map((d) => d.field).sort(),
      ).toEqual(['email', 'password']);
    });

    it('rejects unknown fields', async () => {
      const res = await register({ ...credentials, role: 'admin' }).expect(400);

      expect(res.body.details).toEqual([
        { field: 'role', errors: ['property role should not exist'] },
      ]);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await register(credentials).expect(201);
    });

    it('returns a token for valid credentials, with case-insensitive email', async () => {
      const res = await login({
        ...credentials,
        email: 'RYU@EXAMPLE.COM',
      }).expect(200);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user.email).toBe('ryu@example.com');
    });

    it('returns the same 401 for a wrong password and an unknown email', async () => {
      const wrongPassword = await login({
        ...credentials,
        password: 'shoryuken1',
      }).expect(401);
      const unknownEmail = await login({
        ...credentials,
        email: 'ken@example.com',
      }).expect(401);

      expect(wrongPassword.body).toEqual({
        statusCode: 401,
        error: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
      expect(unknownEmail.body).toEqual(wrongPassword.body);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user for a valid token', async () => {
      const { body } = await register(credentials).expect(201);

      const res = await me(body.accessToken).expect(200);

      expect(res.body).toEqual(body.user);
    });

    it.each([
      ['no header', undefined],
      ['a malformed token', 'not-a-jwt'],
    ])('rejects %s with 401 UNAUTHORIZED', async (_label, token) => {
      const res = await me(token).expect(401);

      expect(res.body).toEqual({
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Missing or invalid access token',
      });
    });

    it('rejects a token signed with another secret', async () => {
      const forged = await new JwtService({
        secret: 'some-other-secret-that-is-at-least-32-chars',
      }).signAsync({
        sub: '00000000-0000-4000-8000-000000000001',
        email: 'x@y.z',
      });

      await me(forged).expect(401);
    });

    it('rejects an expired token', async () => {
      const { body } = await register(credentials).expect(201);
      const expired = await app
        .get(JwtService)
        .signAsync(
          { sub: body.user.id, email: body.user.email },
          { expiresIn: -10 },
        );

      await me(expired).expect(401);
    });

    it('rejects a valid token whose user was deleted', async () => {
      const { body } = await register(credentials).expect(201);
      await truncateAll(app);

      const res = await me(body.accessToken).expect(401);

      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });
});
