import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { type z } from 'zod';
import { type ABILITY_NAMES } from './database.constants.js';
import type * as schema from './schema/index.js';
import { type sourceCharacterSchema } from './seeders/character-source.schema.js';

export type Database = NodePgDatabase<typeof schema>;

export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

export type AbilityName = (typeof ABILITY_NAMES)[number];

export type UserRow = typeof schema.users.$inferSelect;
export type NewUserRow = typeof schema.users.$inferInsert;
export type CharacterRow = typeof schema.characters.$inferSelect;

export type SourceCharacter = z.infer<typeof sourceCharacterSchema>;

export interface SeedSummary {
  characters: number;
  universes: number;
  tags: number;
  characterTags: number;
  characterAbilities: number;
}
