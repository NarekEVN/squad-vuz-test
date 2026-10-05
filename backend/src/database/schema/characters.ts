import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  unique,
} from 'drizzle-orm/pg-core';

export const ABILITY_NAMES = [
  'Mobility',
  'Technique',
  'Survivability',
  'Power',
  'Energy',
] as const;

export type AbilityName = (typeof ABILITY_NAMES)[number];

export const abilityName = pgEnum('ability_name', ABILITY_NAMES);

export const universes = pgTable('universes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
});

export const characters = pgTable(
  'characters',
  {
    id: integer().primaryKey(),
    name: text().notNull(),
    quote: text(),
    image: text().notNull(),
    thumbnail: text(),
    universeId: integer()
      .notNull()
      .references(() => universes.id),
  },
  (table) => [
    index('characters_name_id_idx').on(table.name, table.id),
    index('characters_name_trgm_idx').using(
      'gin',
      sql`lower(${table.name}) gin_trgm_ops`,
    ),
    index('characters_universe_id_idx').on(table.universeId),
  ],
);

export const tags = pgTable('tags', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
});

export const characterTags = pgTable(
  'character_tags',
  {
    characterId: integer()
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    tagId: integer()
      .notNull()
      .references(() => tags.id),
    slot: smallint().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.characterId, table.tagId] }),
    unique('character_tags_character_slot_key').on(
      table.characterId,
      table.slot,
    ),
    index('character_tags_tag_id_character_id_idx').on(
      table.tagId,
      table.characterId,
    ),
    check('character_tags_slot_positive', sql`${table.slot} >= 1`),
  ],
);

export const characterAbilities = pgTable(
  'character_abilities',
  {
    characterId: integer()
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    ability: abilityName().notNull(),
    score: smallint().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.characterId, table.ability] }),
    check(
      'character_abilities_score_range',
      sql`${table.score} between 1 and 10`,
    ),
  ],
);

export type CharacterRow = typeof characters.$inferSelect;
