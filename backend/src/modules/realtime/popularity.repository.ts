import { Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.constants.js';
import { type Database } from '../../database/database.types.js';
import { characters, squadMembers } from '../../database/schema/index.js';
import { type PopularCharacter } from './realtime.types.js';

@Injectable()
export class PopularityRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  mostPicked(limit: number): Promise<PopularCharacter[]> {
    const picks = count(squadMembers.squadId);
    return this.db
      .select({
        characterId: characters.id,
        name: characters.name,
        thumbnail: sql<string>`coalesce(${characters.thumbnail}, ${characters.image})`,
        picks,
      })
      .from(squadMembers)
      .innerJoin(characters, eq(characters.id, squadMembers.characterId))
      .groupBy(characters.id)
      .orderBy(desc(picks), asc(characters.name))
      .limit(limit);
  }
}
