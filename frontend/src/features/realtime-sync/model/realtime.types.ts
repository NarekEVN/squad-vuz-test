export interface SquadChangedMessage {
  squadId: string
  reason: 'created' | 'updated' | 'deleted' | 'member-added' | 'member-removed'
  characterId?: number
}

export interface PopularCharacter {
  characterId: number
  name: string
  thumbnail: string
  picks: number
}

export interface PopularityMessage {
  characters: PopularCharacter[]
  updatedAt: string
}

export interface RealtimeState {
  connected: boolean
  popularity: PopularityMessage | null
}
