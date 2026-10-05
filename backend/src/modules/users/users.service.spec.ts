import { ConflictException } from '@nestjs/common';
import { type Mock } from 'vitest';
import { type UserRow } from '../../database/schema/index.js';
import { type UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

const existingUser: UserRow = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'ryu@example.com',
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService.create', () => {
  let repository: {
    findByEmail: Mock<UsersRepository['findByEmail']>;
    createIfEmailFree: Mock<UsersRepository['createIfEmailFree']>;
  };
  let service: UsersService;

  beforeEach(() => {
    repository = {
      findByEmail: vi.fn<UsersRepository['findByEmail']>(),
      createIfEmailFree: vi.fn<UsersRepository['createIfEmailFree']>(),
    };
    service = new UsersService(repository as unknown as UsersRepository);
  });

  it('creates the user when the email is free', async () => {
    repository.findByEmail.mockResolvedValue(undefined);
    repository.createIfEmailFree.mockResolvedValue(existingUser);

    await expect(service.create('ryu@example.com', 'hash')).resolves.toBe(
      existingUser,
    );
  });

  it('throws EMAIL_TAKEN without inserting when the email exists', async () => {
    repository.findByEmail.mockResolvedValue(existingUser);

    await expect(service.create('ryu@example.com', 'hash')).rejects.toThrow(
      ConflictException,
    );
    expect(repository.createIfEmailFree).not.toHaveBeenCalled();
  });

  it('throws EMAIL_TAKEN when a concurrent request inserted the email first', async () => {
    repository.findByEmail.mockResolvedValue(undefined);
    repository.createIfEmailFree.mockResolvedValue(undefined);

    const error = await service
      .create('ryu@example.com', 'hash')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toMatchObject({
      statusCode: 409,
      error: 'EMAIL_TAKEN',
    });
  });
});
