import { type ABILITY_NAMES } from './character.constants'

export type AbilityName = (typeof ABILITY_NAMES)[number]

export interface CharacterAbility {
  name: AbilityName
  score: number
}

export interface Character {
  id: number
  name: string
  quote: string | null
  image: string
  thumbnail: string
  universe: string
  tags: string[]
  abilities: CharacterAbility[]
}

export interface CharacterPage {
  items: Character[]
  nextCursor: string | null
  total: number
}

export interface FilterOption {
  name: string
  count: number
}

export interface CharacterFilterOptions {
  universes: FilterOption[]
  tags: FilterOption[]
  abilities: AbilityName[]
  sortFields: string[]
}

export interface CharacterQueryArgs {
  search?: string
  tags?: string[]
}
