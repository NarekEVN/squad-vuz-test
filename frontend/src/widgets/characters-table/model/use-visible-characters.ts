import { skipToken } from '@reduxjs/toolkit/query'
import { useCallback, useMemo } from 'react'
import { useGetCharactersInfiniteQuery } from '../../../entities/character/api/characters.api'
import { type Character } from '../../../entities/character/model/character.types'
import { type Squad } from '../../../entities/squad/model/squad.types'
import { useCharacterQueryArgs } from '../../../features/character-filters/model/use-character-query-args'
import { type VisibleCharacters } from './visible-characters.types'

function matchesFilters(character: Character, search: string, tags: string[]): boolean {
  const matchesSearch = character.name.toLowerCase().includes(search.toLowerCase())
  const matchesTags = tags.length === 0 || tags.some((tag) => character.tags.includes(tag))
  return matchesSearch && matchesTags
}

export function useVisibleCharacters(squad: Squad | undefined): VisibleCharacters {
  const { myTeam, search, tags } = useCharacterQueryArgs()
  const query = useGetCharactersInfiniteQuery(myTeam ? skipToken : { search, tags })

  const { fetchNextPage, hasNextPage, isFetching } = query
  const fetchNext = useCallback(() => {
    if (hasNextPage && !isFetching) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetching])

  const teamCharacters = useMemo(
    () =>
      (squad?.members ?? [])
        .map((member) => member.character)
        .filter((character) => matchesFilters(character, search, tags)),
    [squad, search, tags],
  )

  if (myTeam) {
    return {
      characters: teamCharacters,
      total: teamCharacters.length,
      isLoading: squad === undefined,
      isError: false,
      hasMore: false,
      isFetchingMore: false,
      loadMore: () => undefined,
      retry: () => undefined,
    }
  }

  const pages = query.data?.pages ?? []
  return {
    characters: pages.flatMap((page) => page.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading || (query.isFetching && !query.isFetchingNextPage),
    isError: query.isError,
    hasMore: query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    loadMore: fetchNext,
    retry: () => {
      void query.refetch()
    },
  }
}
