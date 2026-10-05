import { SQUAD_MAX_MEMBERS } from '../../../database/database.constants.js';
import { type SquadMemberSlot } from '../squads.types.js';
import { characterAlreadyInSquad, squadFull } from './squad.errors.js';

export function assertCanAddMember(
  memberIds: readonly number[],
  characterId: number,
): void {
  if (memberIds.includes(characterId)) {
    throw characterAlreadyInSquad(characterId);
  }
  if (memberIds.length >= SQUAD_MAX_MEMBERS) {
    throw squadFull();
  }
}

export function assertValidMemberList(characterIds: readonly number[]): void {
  const seen = new Set<number>();
  for (const id of characterIds) {
    if (seen.has(id)) {
      throw characterAlreadyInSquad(id);
    }
    seen.add(id);
  }
  if (characterIds.length > SQUAD_MAX_MEMBERS) {
    throw squadFull();
  }
}

export function firstFreePosition(takenPositions: readonly number[]): number {
  const taken = new Set(takenPositions);
  for (let position = 1; position <= SQUAD_MAX_MEMBERS; position += 1) {
    if (!taken.has(position)) {
      return position;
    }
  }
  throw squadFull();
}

export function slotsInOrder(
  characterIds: readonly number[],
): SquadMemberSlot[] {
  return characterIds.map((characterId, index) => ({
    characterId,
    position: index + 1,
  }));
}
