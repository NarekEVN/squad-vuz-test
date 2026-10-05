import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, inArray, ne, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import {
  type Database,
  type DatabaseExecutor,
  type SquadRow,
  type Transaction,
} from '../../database/database.types.js';
import {
  characters,
  squadMembers,
  squads,
  users,
} from '../../database/schema/index.js';
import { type SquadMemberSlot, type SquadSummaryRow } from './squads.types.js';

@Injectable()
export class SquadsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  transaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(work);
  }

  async lockUser(tx: Transaction, userId: string): Promise<void> {
    await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .for('update');
  }

  async lockSquad(
    tx: Transaction,
    userId: string,
    squadId: string,
  ): Promise<SquadRow | undefined> {
    const [squad] = await tx
      .select()
      .from(squads)
      .where(and(eq(squads.id, squadId), eq(squads.userId, userId)))
      .for('update');
    return squad;
  }

  async findOwned(
    userId: string,
    squadId: string,
  ): Promise<SquadRow | undefined> {
    const [squad] = await this.db
      .select()
      .from(squads)
      .where(and(eq(squads.id, squadId), eq(squads.userId, userId)));
    return squad;
  }

  findSummaries(userId: string): Promise<SquadSummaryRow[]> {
    return this.db
      .select({
        id: squads.id,
        name: squads.name,
        memberCount: count(squadMembers.characterId),
        createdAt: squads.createdAt,
        updatedAt: squads.updatedAt,
      })
      .from(squads)
      .leftJoin(squadMembers, eq(squadMembers.squadId, squads.id))
      .where(eq(squads.userId, userId))
      .groupBy(squads.id)
      .orderBy(asc(squads.createdAt), asc(squads.id));
  }

  async countForUser(tx: Transaction, userId: string): Promise<number> {
    const [row] = await tx
      .select({ total: count() })
      .from(squads)
      .where(eq(squads.userId, userId));
    return row?.total ?? 0;
  }

  async isNameTaken(
    tx: Transaction,
    userId: string,
    name: string,
    exceptSquadId?: string,
  ): Promise<boolean> {
    const [row] = await tx
      .select({ id: squads.id })
      .from(squads)
      .where(
        and(
          eq(squads.userId, userId),
          eq(sql`lower(${squads.name})`, name.toLowerCase()),
          exceptSquadId ? ne(squads.id, exceptSquadId) : undefined,
        ),
      )
      .limit(1);
    return row !== undefined;
  }

  async insert(
    tx: Transaction,
    userId: string,
    name: string,
  ): Promise<SquadRow> {
    const [squad] = await tx
      .insert(squads)
      .values({ userId, name })
      .returning();
    if (!squad) {
      throw new Error('Insert into squads returned no row');
    }
    return squad;
  }

  async update(
    tx: Transaction,
    squadId: string,
    changes: { name?: string },
  ): Promise<SquadRow> {
    const [squad] = await tx
      .update(squads)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(squads.id, squadId))
      .returning();
    if (!squad) {
      throw new Error(`Squad ${squadId} disappeared during an update`);
    }
    return squad;
  }

  async delete(userId: string, squadId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(squads)
      .where(and(eq(squads.id, squadId), eq(squads.userId, userId)))
      .returning({ id: squads.id });
    return deleted.length > 0;
  }

  findMembers(
    squadId: string,
    executor: DatabaseExecutor = this.db,
  ): Promise<SquadMemberSlot[]> {
    return executor
      .select({
        characterId: squadMembers.characterId,
        position: squadMembers.position,
      })
      .from(squadMembers)
      .where(eq(squadMembers.squadId, squadId))
      .orderBy(asc(squadMembers.position));
  }

  async insertMembers(
    tx: Transaction,
    squadId: string,
    members: SquadMemberSlot[],
  ): Promise<void> {
    if (members.length === 0) {
      return;
    }
    await tx
      .insert(squadMembers)
      .values(members.map((member) => ({ squadId, ...member })));
  }

  async deleteMember(
    tx: Transaction,
    squadId: string,
    characterId: number,
  ): Promise<boolean> {
    const deleted = await tx
      .delete(squadMembers)
      .where(
        and(
          eq(squadMembers.squadId, squadId),
          eq(squadMembers.characterId, characterId),
        ),
      )
      .returning({ characterId: squadMembers.characterId });
    return deleted.length > 0;
  }

  async deleteAllMembers(tx: Transaction, squadId: string): Promise<void> {
    await tx.delete(squadMembers).where(eq(squadMembers.squadId, squadId));
  }

  async existingCharacterIds(
    tx: Transaction,
    ids: number[],
  ): Promise<Set<number>> {
    if (ids.length === 0) {
      return new Set();
    }
    const rows = await tx
      .select({ id: characters.id })
      .from(characters)
      .where(inArray(characters.id, ids));
    return new Set(rows.map((row) => row.id));
  }
}
