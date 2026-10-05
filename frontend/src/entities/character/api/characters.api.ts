import { baseApi } from '../../../shared/api/base-api'
import { CHARACTERS_PAGE_SIZE } from '../model/character.constants'
import {
  type CharacterFilterOptions,
  type CharacterPage,
  type CharacterQueryArgs,
} from '../model/character.types'

export const charactersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCharacters: build.infiniteQuery<CharacterPage, CharacterQueryArgs, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/characters',
        params: {
          search: queryArg.search || undefined,
          tags: queryArg.tags?.length ? queryArg.tags.join(',') : undefined,
          limit: CHARACTERS_PAGE_SIZE,
          cursor: pageParam ?? undefined,
        },
      }),
    }),
    getCharacterFilterOptions: build.query<CharacterFilterOptions, void>({
      query: () => '/characters/filters',
    }),
  }),
})

export const { useGetCharactersInfiniteQuery, useGetCharacterFilterOptionsQuery } = charactersApi
