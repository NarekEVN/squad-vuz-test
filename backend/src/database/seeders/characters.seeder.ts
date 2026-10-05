import { inArray, sql } from 'drizzle-orm';
import { type Database } from '../database.module.js';
import {
  characterAbilities,
  characters,
  characterTags,
  tags,
  universes,
} from '../schema/index.js';
import { type SourceCharacter } from './character-source.schema.js';

export interface SeedSummary {
  characters: number;
  universes: number;
  tags: number;
  characterTags: number;
  characterAbilities: number;
}

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function idFor(ids: Map<string, number>, name: string): number {
  const id = ids.get(name);
  if (id === undefined) {
    throw new Error(`No id was assigned to "${name}"`);
  }
  return id;
}

async function upsertNames(
  tx: Transaction,
  table: typeof universes | typeof tags,
  names: string[],
): Promise<Map<string, number>> {
  await tx
    .insert(table)
    .values(names.map((name) => ({ name })))
    .onConflictDoNothing({ target: table.name });
  const rows = await tx
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(inArray(table.name, names));
  return new Map(rows.map((row) => [row.name, row.id]));
}

export async function seedCharacters(
  db: Database,
  source: SourceCharacter[],
): Promise<SeedSummary> {
  return db.transaction(async (tx) => {
    const universeIds = await upsertNames(
      tx,
      universes,
      unique(source.map((c) => c.universe)),
    );
    const tagIds = await upsertNames(
      tx,
      tags,
      unique(source.flatMap((c) => (c.tags ?? []).map((t) => t.tag_name))),
    );

    const characterRows = source.map((c) => ({
      id: c.id,
      name: c.name,
      quote: c.quote ?? null,
      image: c.image,
      thumbnail: c.thumbnail ?? null,
      universeId: idFor(universeIds, c.universe),
    }));
    await tx
      .insert(characters)
      .values(characterRows)
      .onConflictDoUpdate({
        target: characters.id,
        set: {
          name: sql`excluded.name`,
          quote: sql`excluded.quote`,
          image: sql`excluded.image`,
          thumbnail: sql`excluded.thumbnail`,
          universeId: sql`excluded.universe_id`,
        },
      });

    const characterIds = source.map((c) => c.id);
    await tx
      .delete(characterTags)
      .where(inArray(characterTags.characterId, characterIds));
    await tx
      .delete(characterAbilities)
      .where(inArray(characterAbilities.characterId, characterIds));

    const tagRows = source.flatMap((c) =>
      (c.tags ?? []).map((t) => ({
        characterId: c.id,
        tagId: idFor(tagIds, t.tag_name),
        slot: t.slot,
      })),
    );
    const abilityRows = source.flatMap((c) =>
      c.abilities.map((a) => ({
        characterId: c.id,
        ability: a.abilityName,
        score: a.abilityScore,
      })),
    );
    if (tagRows.length > 0) {
      await tx.insert(characterTags).values(tagRows);
    }
    await tx.insert(characterAbilities).values(abilityRows);

    return {
      characters: characterRows.length,
      universes: universeIds.size,
      tags: tagIds.size,
      characterTags: tagRows.length,
      characterAbilities: abilityRows.length,
    };
  });
}
