import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import {
  decodeCursor,
  encodeCursor,
} from '../../common/utils/pagination.util.js';
import { CharactersService } from '../characters/characters.service.js';
import { type SquadChangedEvent } from '../squads/squads.types.js';
import { DAY_MS, PICK_STATS_TOP_CHARACTERS } from './activity.constants.js';
import {
  toActivityEventDto,
  toCharacterPickStatDto,
} from './activity.mapper.js';
import { ActivityRepository } from './activity.repository.js';
import {
  type ActivityCharacter,
  type HistoryCursor,
} from './activity.types.js';
import { type PickStatsResponseDto } from './dto/pick-stats-response.dto.js';
import { type SquadHistoryQueryDto } from './dto/squad-history-query.dto.js';
import { type SquadHistoryResponseDto } from './dto/squad-history-response.dto.js';

const historyCursorSchema: z.ZodType<HistoryCursor> = z.object({
  occurredAt: z.iso.datetime(),
  id: z.string().regex(/^[0-9a-f]{24}$/),
});

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly charactersService: CharactersService,
  ) {}

  async record(event: SquadChangedEvent): Promise<void> {
    const id = new ObjectId();
    await this.activityRepository.insert({
      _id: id,
      type: event.reason,
      userId: event.userId,
      squadId: event.squadId,
      squadName: event.squadName,
      ...(event.characterId === undefined
        ? {}
        : { character: await this.characterSnapshot(event.characterId) }),
      occurredAt: event.occurredAt,
    });
  }

  async squadHistory(
    userId: string,
    squadId: string,
    query: SquadHistoryQueryDto,
  ): Promise<SquadHistoryResponseDto> {
    const before = query.cursor
      ? decodeCursor(query.cursor, historyCursorSchema)
      : undefined;
    const { events, hasMore } = await this.activityRepository.findSquadHistory(
      userId,
      squadId,
      query.limit,
      before,
    );
    const last = events.at(-1);
    return {
      items: events.map(toActivityEventDto),
      nextCursor:
        hasMore && last?._id
          ? encodeCursor({
              occurredAt: last.occurredAt.toISOString(),
              id: last._id.toHexString(),
            })
          : null,
    };
  }

  async pickStats(days: number): Promise<PickStatsResponseDto> {
    const since = new Date(Date.now() - days * DAY_MS);
    const { characters, daily, totals } =
      await this.activityRepository.pickStats(since, PICK_STATS_TOP_CHARACTERS);
    return {
      since: since.toISOString(),
      totals: totals[0] ?? { added: 0, removed: 0 },
      characters: characters.map(toCharacterPickStatDto),
      daily,
    };
  }

  private async characterSnapshot(
    characterId: number,
  ): Promise<ActivityCharacter> {
    const [character] = await this.charactersService.findManyByIds([
      characterId,
    ]);
    return {
      id: characterId,
      name: character?.name ?? `Character ${characterId}`,
      thumbnail: character?.thumbnail ?? '',
    };
  }
}
