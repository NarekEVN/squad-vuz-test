import { type AbilityName, type Character } from '../model/character.types'

export function abilityScore(character: Character, ability: AbilityName): number | undefined {
  return character.abilities.find((entry) => entry.name === ability)?.score
}
