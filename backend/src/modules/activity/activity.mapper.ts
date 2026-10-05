import { type ActivityEventDto } from './dto/activity-event.dto.js';
import { type CharacterPickStatDto } from './dto/character-pick-stat.dto.js';
import {
  type ActivityEventDocument,
  type CharacterPickStat,
} from './activity.types.js';

export function toActivityEventDto(
  event: ActivityEventDocument,
): ActivityEventDto {
  return {
    id: event._id?.toHexString() ?? '',
    type: event.type,
    squadId: event.squadId,
    squadName: event.squadName,
    character: event.character ?? null,
    occurredAt: event.occurredAt.toISOString(),
  };
}

export function toCharacterPickStatDto(
  stat: CharacterPickStat,
): CharacterPickStatDto {
  return {
    ...stat,
    lastPickedAt: stat.lastPickedAt?.toISOString() ?? null,
  };
}
