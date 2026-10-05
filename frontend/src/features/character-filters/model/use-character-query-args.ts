import { useMemo } from 'react'
import { type ResolvedCharacterFilters } from './character-filters.types'
import { useDebouncedValue } from '../../../shared/lib/use-debounced-value'
import { useAppSelector } from '../../../shared/lib/store-hooks'
import { SEARCH_DEBOUNCE_MS } from './character-filters.constants'
import { selectCharacterFilters } from './character-filters.slice'

export function useCharacterQueryArgs(): ResolvedCharacterFilters {
  const { search, tags, myTeam } = useAppSelector(selectCharacterFilters)
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)

  return useMemo(
    () => ({ search: debouncedSearch, tags: [...tags].sort(), myTeam }),
    [debouncedSearch, tags, myTeam],
  )
}
