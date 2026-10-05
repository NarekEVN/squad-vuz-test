import { API_TAGS } from '../../../shared/api/api.constants'
import { baseApi } from '../../../shared/api/base-api'
import { withMemberAdded, withMemberRemoved } from '../lib/optimistic-members'
import {
  type CreateSquadArgs,
  type Squad,
  type SquadMemberArgs,
  type SquadSummary,
  type UpdateSquadArgs,
} from '../model/squad.types'

export const squadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSquads: build.query<SquadSummary[], void>({
      query: () => '/squads',
      providesTags: [API_TAGS.squadList],
    }),
    getSquad: build.query<Squad, string>({
      query: (squadId) => `/squads/${squadId}`,
      providesTags: (_result, _error, squadId) => [{ type: API_TAGS.squad, id: squadId }],
    }),
    createSquad: build.mutation<Squad, CreateSquadArgs>({
      query: (body) => ({ url: '/squads', method: 'POST', body }),
      invalidatesTags: [API_TAGS.squadList],
    }),
    updateSquad: build.mutation<Squad, UpdateSquadArgs>({
      query: ({ squadId, ...body }) => ({ url: `/squads/${squadId}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { squadId }) => [
        API_TAGS.squadList,
        { type: API_TAGS.squad, id: squadId },
      ],
    }),
    deleteSquad: build.mutation<void, string>({
      query: (squadId) => ({ url: `/squads/${squadId}`, method: 'DELETE' }),
      invalidatesTags: [API_TAGS.squadList],
    }),
    addSquadMember: build.mutation<Squad, SquadMemberArgs>({
      query: ({ squadId, character }) => ({
        url: `/squads/${squadId}/characters/${character.id}`,
        method: 'POST',
      }),
      async onQueryStarted({ squadId, character }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          squadsApi.util.updateQueryData('getSquad', squadId, (draft) =>
            withMemberAdded(draft, character),
          ),
        )
        try {
          const { data } = await queryFulfilled
          dispatch(squadsApi.util.upsertQueryData('getSquad', squadId, data))
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: [API_TAGS.squadList],
    }),
    removeSquadMember: build.mutation<Squad, SquadMemberArgs>({
      query: ({ squadId, character }) => ({
        url: `/squads/${squadId}/characters/${character.id}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ squadId, character }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          squadsApi.util.updateQueryData('getSquad', squadId, (draft) =>
            withMemberRemoved(draft, character.id),
          ),
        )
        try {
          const { data } = await queryFulfilled
          dispatch(squadsApi.util.upsertQueryData('getSquad', squadId, data))
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: [API_TAGS.squadList],
    }),
  }),
})

export const {
  useGetSquadsQuery,
  useGetSquadQuery,
  useCreateSquadMutation,
  useUpdateSquadMutation,
  useDeleteSquadMutation,
  useAddSquadMemberMutation,
  useRemoveSquadMemberMutation,
} = squadsApi
