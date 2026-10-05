import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { SQUAD_MAX_MEMBERS } from '../database.constants.js';
import { characters } from './characters.js';
import { users } from './users.js';

export const squads = pgTable(
  'squads',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('squads_user_id_name_lower_key').on(
      table.userId,
      sql`lower(${table.name})`,
    ),
  ],
);

export const squadMembers = pgTable(
  'squad_members',
  {
    squadId: uuid()
      .notNull()
      .references(() => squads.id, { onDelete: 'cascade' }),
    characterId: integer()
      .notNull()
      .references(() => characters.id),
    position: smallint().notNull(),
    addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.squadId, table.characterId] }),
    unique('squad_members_squad_id_position_key').on(
      table.squadId,
      table.position,
    ),
    check(
      'squad_members_position_range',
      sql`${table.position} between 1 and ${sql.raw(String(SQUAD_MAX_MEMBERS))}`,
    ),
    index('squad_members_character_id_idx').on(table.characterId),
  ],
);
