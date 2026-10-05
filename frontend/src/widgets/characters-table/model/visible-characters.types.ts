import { type Character } from '../../../entities/character/model/character.types'

export interface VisibleCharacters {
  characters: Character[]
  total: number
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  isFetchingMore: boolean
  loadMore: () => void
  retry: () => void
}
