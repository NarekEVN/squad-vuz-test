import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from '@node-rs/argon2';
import { type Mock } from 'vitest';
import { type UserRow } from '../../database/database.types.js';
import { type UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { type AccessTokenPayload } from './auth.types.js';

const SECRET = 'unit-test-secret-that-is-at-least-32-chars';

async function expectUnauthorized(
  promise: Promise<unknown>,
  code: string,
): Promise<void> {
  const error: unknown = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(UnauthorizedException);
  expect((error as UnauthorizedException).getResponse()).toMatchObject({
    statusCode: 401,
    error: code,
  });
}

function userRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'ryu@example.com',
    passwordHash: '',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let usersService: {
    create: Mock<UsersService['create']>;
    findByEmail: Mock<UsersService['findByEmail']>;
    findById: Mock<UsersService['findById']>;
  };
  let jwtService: JwtService;
  let service: AuthService;

  beforeEach(async () => {
    usersService = {
      create: vi.fn<UsersService['create']>(),
      findByEmail: vi.fn<UsersService['findByEmail']>(),
      findById: vi.fn<UsersService['findById']>(),
    };
    jwtService = new JwtService({
      secret: SECRET,
      signOptions: { expiresIn: 3600 },
    });
    const config = new ConfigService({ auth: { jwtExpiresInSeconds: 3600 } });
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService,
      config as never,
    );
    await service.onModuleInit();
  });

  describe('register', () => {
    it('stores an argon2id hash, never the plain password', async () => {
      usersService.create.mockImplementation((email, passwordHash) =>
        Promise.resolve(userRow({ email, passwordHash })),
      );

      await service.register({
        email: 'ryu@example.com',
        password: 'hadouken123',
      });

      const [, storedHash] = usersService.create.mock.calls[0] ?? [];
      expect(storedHash).toMatch(/^\$argon2id\$/);
      expect(storedHash).not.toContain('hadouken123');
    });

    it('returns a verifiable token for the new user', async () => {
      usersService.create.mockResolvedValue(userRow());

      const result = await service.register({
        email: 'ryu@example.com',
        password: 'hadouken123',
      });

      const payload = await jwtService.verifyAsync<AccessTokenPayload>(
        result.accessToken,
      );
      expect(payload.sub).toBe(userRow().id);
      expect(result).toMatchObject({
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: userRow().id,
          email: 'ryu@example.com',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('issues a token when the password matches', async () => {
      usersService.findByEmail.mockResolvedValue(
        userRow({ passwordHash: await hash('hadouken123') }),
      );

      const result = await service.login({
        email: 'ryu@example.com',
        password: 'hadouken123',
      });

      expect(result.accessToken).toEqual(expect.any(String));
    });

    it('rejects a wrong password with INVALID_CREDENTIALS', async () => {
      usersService.findByEmail.mockResolvedValue(
        userRow({ passwordHash: await hash('hadouken123') }),
      );

      await expectUnauthorized(
        service.login({ email: 'ryu@example.com', password: 'shoryuken' }),
        'INVALID_CREDENTIALS',
      );
    });

    it('rejects an unknown email with the same error', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await expectUnauthorized(
        service.login({ email: 'ken@example.com', password: 'whatever1' }),
        'INVALID_CREDENTIALS',
      );
    });
  });

  describe('me', () => {
    it('returns the profile without the password hash', async () => {
      usersService.findById.mockResolvedValue(userRow({ passwordHash: 'x' }));

      await expect(service.me(userRow().id)).resolves.toEqual({
        id: userRow().id,
        email: 'ryu@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('rejects a token whose user no longer exists', async () => {
      usersService.findById.mockResolvedValue(undefined);

      await expectUnauthorized(service.me('missing'), 'UNAUTHORIZED');
    });
  });
});
