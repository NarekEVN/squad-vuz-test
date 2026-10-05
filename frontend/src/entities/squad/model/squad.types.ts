import { type AbilityName, type Character } from '../../character/model/character.types'

export interface SquadMember {
  position: number
  character: Character
}

export interface AbilityStat {
  name: AbilityName
  average: number | null
  min: number | null
  max: number | null
}

export interface SquadStats {
  memberCount: number
  overallAverage: number | null
  abilities: AbilityStat[]
}

export interface Squad {
  id: string
  name: string
  members: SquadMember[]
  stats: SquadStats
  createdAt: string
  updatedAt: string
}

export interface SquadSummary {
  id: string
  name: string
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateSquadArgs {
  name: string
  characterIds?: number[]
}

export interface UpdateSquadArgs {
  squadId: string
  name?: string
  characterIds?: number[]
}

export interface SquadMemberArgs {
  squadId: string
  character: Character
}

export interface ActiveSquadState {
  squadId: string | null
}
