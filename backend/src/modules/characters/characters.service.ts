import { Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import {
  decodeCursor,
  encodeCursor,
  invalidCursor,
} from '../../common/utils/pagination.util.js';
import { ABILITY_NAMES } from '../../database/schema/index.js';
import { CacheScope } from '../../integrations/redis/cache-keys.js';
import {
  type CacheResult,
  CacheService,
} from '../../integrations/redis/cache.service.js';
import { toCharacterDtos } from './characters.mapper.js';
import {
  type CharacterBaseRow,
  type CharacterFilters,
  type CharacterKeyset,
  CharactersRepository,
} from './characters.repository.js';
import {
  type CharacterDto,
  type CharacterFiltersResponseDto,
  type CharacterListResponseDto,
} from './dto/character.dto.js';
import {
  CHARACTER_SORT_FIELDS,
  type CharacterSortField,
  type ListCharactersQueryDto,
  SORT_ORDERS,
  type SortOrder,
} from './dto/list-characters-query.dto.js';

const cursorSchema = z.object({
  sort: z.enum(CHARACTER_SORT_FIELDS),
  order: z.enum(SORT_ORDERS),
  name: z.string(),
  id: z.number().int(),
});

interface PageRequest {
  filters: CharacterFilters;
  sort: CharacterSortField;
  order: SortOrder;
  limit: number;
  after?: CharacterKeyset;
}

@Injectable()
export class CharactersService {
  constructor(
    private readonly charactersRepository: CharactersRepository,
    private readonly cache: CacheService,
  ) {}

  list(
    query: ListCharactersQueryDto,
  ): Promise<CacheResult<CharacterListResponseDto>> {
    const request: PageRequest = {
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
        ? this.keysetFromCursor(query.cursor, query.sort, query.order)
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
      throw new NotFoundException(`Character ${id} does not exist`, {
        description: 'CHARACTER_NOT_FOUND',
      });
    }
    return { value: result.value, status: result.status };
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
    request: PageRequest,
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
          ? encodeCursor({
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

  private keysetFromCursor(
    cursor: string,
    sort: CharacterSortField,
    order: SortOrder,
  ): CharacterKeyset {
    const decoded = decodeCursor(cursor, cursorSchema);
    if (decoded.sort !== sort || decoded.order !== order) {
      throw invalidCursor();
    }
    return { name: decoded.name, id: decoded.id };
  }
}
