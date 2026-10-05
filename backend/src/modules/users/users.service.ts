import { ConflictException, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../common/constants/error-codes.constants.js';
import { type UserRow } from '../../database/database.types.js';
import { UsersRepository } from './users.repository.js';

function emailTaken(): ConflictException {
  return new ConflictException('An account with this email already exists', {
    description: ErrorCode.EmailTaken,
  });
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string): Promise<UserRow | undefined> {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string): Promise<UserRow | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  async create(email: string, passwordHash: string): Promise<UserRow> {
    if (await this.usersRepository.findByEmail(email)) {
      throw emailTaken();
    }
    const user = await this.usersRepository.createIfEmailFree({
      email,
      passwordHash,
    });
    if (!user) {
      throw emailTaken();
    }
    return user;
  }
}
