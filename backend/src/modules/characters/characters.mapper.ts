import {
  type CharacterAbilityRow,
  type CharacterBaseRow,
  type CharacterTagRow,
} from './characters.types.js';
import { type CharacterAbilityDto } from './dto/character-ability.dto.js';
import { type CharacterDto } from './dto/character.dto.js';

function groupByCharacter<T extends { characterId: number }>(
  rows: T[],
): Map<number, T[]> {
  const groups = new Map<number, T[]>();
  for (const row of rows) {
    const group = groups.get(row.characterId);
    if (group) {
      group.push(row);
    } else {
      groups.set(row.characterId, [row]);
    }
  }
  return groups;
}

export function toCharacterDtos(
  rows: CharacterBaseRow[],
  tagRows: CharacterTagRow[],
  abilityRows: CharacterAbilityRow[],
): CharacterDto[] {
  const tagsByCharacter = groupByCharacter(tagRows);
  const abilitiesByCharacter = groupByCharacter(abilityRows);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    quote: row.quote,
    image: row.image,
    thumbnail: row.thumbnail ?? row.image,
    universe: row.universe,
    tags: (tagsByCharacter.get(row.id) ?? []).map((tag) => tag.name),
    abilities: (abilitiesByCharacter.get(row.id) ?? []).map(
      (ability): CharacterAbilityDto => ({
        name: ability.ability,
        score: ability.score,
      }),
    ),
  }));
}
