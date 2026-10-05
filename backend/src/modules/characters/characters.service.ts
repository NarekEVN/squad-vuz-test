import { Injectable } from '@nestjs/common';
import { ABILITY_NAMES } from '../../database/database.constants.js';
import { CacheService } from '../../integrations/redis/cache.service.js';
import { CacheScope } from '../../integrations/redis/redis.constants.js';
import { type CacheResult } from '../../integrations/redis/redis.types.js';
import { CHARACTER_SORT_FIELDS } from './characters.constants.js';
import {
  encodeCharacterCursor,
  keysetFromCursor,
} from './characters.cursor.js';
import { characterNotFound } from './characters.errors.js';
import { toCharacterDtos } from './characters.mapper.js';
import { CharactersRepository } from './characters.repository.js';
import {
  type CharacterBaseRow,
  type CharacterPageRequest,
} from './characters.types.js';
import { type CharacterFiltersResponseDto } from './dto/character-filters-response.dto.js';
import { type CharacterListResponseDto } from './dto/character-list-response.dto.js';
import { type CharacterDto } from './dto/character.dto.js';
import { type ListCharactersQueryDto } from './dto/list-characters-query.dto.js';

@Injectable()
export class CharactersService {
  constructor(
    private readonly charactersRepository: CharactersRepository,
    private readonly cache: CacheService,
  ) {}

  list(
    query: ListCharactersQueryDto,
  ): Promise<CacheResult<CharacterListResponseDto>> {
    const request: CharacterPageRequest = {
      filters: {
        search: query.search,
        tags: query.tags,
        tagMatch: query.tags ? query.tagMatch : 'any',
        universes: query.universe,
      },
      sort: query.sort,
      order: query.order,
      limit: query.limit,
      after: query.cursor
        ? keysetFromCursor(query.cursor, query.sort, query.order)
        : undefined,
    };
    return this.cache.getOrSet(
      CacheScope.Characters,
      `list:${CacheService.hashKey(request)}`,
      () => this.loadPage(request),
    );
  }

  async findOne(id: number): Promise<CacheResult<CharacterDto>> {
    const result = await this.cache.getOrSet(
      CacheScope.Characters,
      `character:${id}`,
      async () => {
        const row = await this.charactersRepository.findById(id);
        return row ? ((await this.withDetails([row]))[0] ?? null) : null;
      },
    );
    if (!result.value) {
      throw characterNotFound(id);
    }
    return { value: result.value, status: result.status };
  }

  async findManyByIds(ids: number[]): Promise<CharacterDto[]> {
    return this.withDetails(await this.charactersRepository.findByIds(ids));
  }

  filters(): Promise<CacheResult<CharacterFiltersResponseDto>> {
    return this.cache.getOrSet(CacheScope.Characters, 'filters', async () => {
      const [universes, tags] = await Promise.all([
        this.charactersRepository.universeOptions(),
        this.charactersRepository.tagOptions(),
      ]);
      return {
        universes,
        tags,
        abilities: [...ABILITY_NAMES],
        sortFields: [...CHARACTER_SORT_FIELDS],
      };
    });
  }

  private async loadPage(
    request: CharacterPageRequest,
  ): Promise<CharacterListResponseDto> {
    const [rows, total] = await Promise.all([
      this.charactersRepository.findPage({
        ...request,
        limit: request.limit + 1,
      }),
      this.charactersRepository.countMatching(request.filters),
    ]);
    const page = rows.slice(0, request.limit);
    const last = page.at(-1);
    const hasMore = rows.length > request.limit;

    return {
      items: await this.withDetails(page),
      nextCursor:
        hasMore && last
          ? encodeCharacterCursor({
              sort: request.sort,
              order: request.order,
              name: last.name,
              id: last.id,
            })
          : null,
      total,
    };
  }

  private async withDetails(rows: CharacterBaseRow[]): Promise<CharacterDto[]> {
    const ids = rows.map((row) => row.id);
    const [tagRows, abilityRows] = await Promise.all([
      this.charactersRepository.findTags(ids),
      this.charactersRepository.findAbilities(ids),
    ]);
    return toCharacterDtos(rows, tagRows, abilityRows);
  }
}
