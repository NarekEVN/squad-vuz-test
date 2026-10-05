import { type SquadRow } from '../../database/database.types.js';
import { type CharacterDto } from '../characters/dto/character.dto.js';
import { computeSquadStats } from './domain/squad.stats.js';
import { type SquadSummaryDto } from './dto/squad-summary.dto.js';
import { type SquadDto } from './dto/squad.dto.js';
import { type SquadMemberSlot, type SquadSummaryRow } from './squads.types.js';

export function toSquadDto(
  squad: SquadRow,
  slots: SquadMemberSlot[],
  characters: CharacterDto[],
): SquadDto {
  const byId = new Map(
    characters.map((character) => [character.id, character]),
  );
  const members = [...slots]
    .sort((a, b) => a.position - b.position)
    .flatMap((slot) => {
      const character = byId.get(slot.characterId);
      return character ? [{ position: slot.position, character }] : [];
    });

  return {
    id: squad.id,
    name: squad.name,
    members,
    stats: computeSquadStats(members.map((member) => member.character)),
    createdAt: squad.createdAt.toISOString(),
    updatedAt: squad.updatedAt.toISOString(),
  };
}

export function toSquadSummaryDto(row: SquadSummaryRow): SquadSummaryDto {
  return {
    id: row.id,
    name: row.name,
    memberCount: row.memberCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
