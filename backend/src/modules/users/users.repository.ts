import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import { type Database } from '../../database/database.types.js';
import {
  type NewUserRow,
  type UserRow,
} from '../../database/database.types.js';
import { users } from '../../database/schema/index.js';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findById(id: string): Promise<UserRow | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
      .limit(1);
    return user;
  }

  async createIfEmailFree(values: NewUserRow): Promise<UserRow | undefined> {
    const [user] = await this.db
      .insert(users)
      .values(values)
      .onConflictDoNothing()
      .returning();
    return user;
  }
}
