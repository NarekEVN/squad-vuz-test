import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  lt,
  type SQL,
  sql,
} from 'drizzle-orm';
import { escapeLike } from '../../common/utils/sql.util.js';
import { DRIZZLE } from '../../database/database.constants.js';
import { type Database } from '../../database/database.types.js';
import {
  characterAbilities,
  characters,
  characterTags,
  tags,
  universes,
} from '../../database/schema/index.js';
import { CHARACTER_BASE_COLUMNS } from './characters.constants.js';
import {
  type CharacterAbilityRow,
  type CharacterBaseRow,
  type CharacterFilters,
  type CharacterPageRequest,
  type CharacterTagRow,
  type FilterOptionRow,
  type TagMatchMode,
} from './characters.types.js';

@Injectable()
export class CharactersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findPage(query: CharacterPageRequest): Promise<CharacterBaseRow[]> {
    const direction = query.order === 'asc' ? asc : desc;
    const orderBy =
      query.sort === 'name'
        ? [direction(characters.name), direction(characters.id)]
        : [direction(characters.id)];

    return this.db
      .select(CHARACTER_BASE_COLUMNS)
      .from(characters)
      .innerJoin(universes, eq(universes.id, characters.universeId))
      .where(and(this.filterBy(query.filters), this.keysetAfter(query)))
      .orderBy(...orderBy)
      .limit(query.limit);
  }

  async countMatching(filters: CharacterFilters): Promise<number> {
    const [row] = await this.db
      .select({ total: count() })
      .from(characters)
      .innerJoin(universes, eq(universes.id, characters.universeId))
      .where(this.filterBy(filters));
    return row?.total ?? 0;
  }

  async findById(id: number): Promise<CharacterBaseRow | undefined> {
    const [row] = await this.db
      .select(CHARACTER_BASE_COLUMNS)
      .from(characters)
      .innerJoin(universes, eq(universes.id, characters.universeId))
      .where(eq(characters.id, id))
      .limit(1);
    return row;
  }

  async findTags(characterIds: number[]): Promise<CharacterTagRow[]> {
    if (characterIds.length === 0) {
      return [];
    }
    return this.db
      .select({ characterId: characterTags.characterId, name: tags.name })
      .from(characterTags)
      .innerJoin(tags, eq(tags.id, characterTags.tagId))
      .where(inArray(characterTags.characterId, characterIds))
      .orderBy(characterTags.characterId, characterTags.slot);
  }

  async findAbilities(characterIds: number[]): Promise<CharacterAbilityRow[]> {
    if (characterIds.length === 0) {
      return [];
    }
    return this.db
      .select({
        characterId: characterAbilities.characterId,
        ability: characterAbilities.ability,
        score: characterAbilities.score,
      })
      .from(characterAbilities)
      .where(inArray(characterAbilities.characterId, characterIds))
      .orderBy(characterAbilities.characterId, characterAbilities.ability);
  }

  async universeOptions(): Promise<FilterOptionRow[]> {
    return this.db
      .select({ name: universes.name, count: count(characters.id) })
      .from(universes)
      .leftJoin(characters, eq(characters.universeId, universes.id))
      .groupBy(universes.id)
      .orderBy(universes.name);
  }

  async tagOptions(): Promise<FilterOptionRow[]> {
    return this.db
      .select({ name: tags.name, count: count(characterTags.characterId) })
      .from(tags)
      .leftJoin(characterTags, eq(characterTags.tagId, tags.id))
      .groupBy(tags.id)
      .orderBy(tags.name);
  }

  private filterBy(filters: CharacterFilters): SQL | undefined {
    return and(
      filters.search
        ? sql`lower(${characters.name}) like ${`%${escapeLike(filters.search.toLowerCase())}%`}`
        : undefined,
      filters.universes
        ? inArray(universes.name, filters.universes)
        : undefined,
      filters.tags
        ? inArray(
            characters.id,
            this.charactersWithTags(filters.tags, filters.tagMatch),
          )
        : undefined,
    );
  }

  private charactersWithTags(tagNames: string[], match: TagMatchMode) {
    const matching = this.db
      .select({ characterId: characterTags.characterId })
      .from(characterTags)
      .innerJoin(tags, eq(tags.id, characterTags.tagId))
      .where(inArray(tags.name, tagNames))
      .groupBy(characterTags.characterId);
    return match === 'all'
      ? matching.having(sql`count(*) = ${tagNames.length}`)
      : matching;
  }

  private keysetAfter(query: CharacterPageRequest): SQL | undefined {
    if (!query.after) {
      return undefined;
    }
    const { name, id } = query.after;
    if (query.sort === 'id') {
      return query.order === 'asc'
        ? gt(characters.id, id)
        : lt(characters.id, id);
    }
    return query.order === 'asc'
      ? sql`(${characters.name}, ${characters.id}) > (${name}, ${id})`
      : sql`(${characters.name}, ${characters.id}) < (${name}, ${id})`;
  }
}
