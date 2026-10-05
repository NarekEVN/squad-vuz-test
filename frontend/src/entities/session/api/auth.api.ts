import { API_TAGS } from '../../../shared/api/api.constants'
import { baseApi } from '../../../shared/api/base-api'
import { sessionStarted } from '../model/session.slice'
import { type AuthResponse, type Credentials, type SessionUser } from '../model/session.types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, Credentials>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(sessionStarted(data))
      },
    }),
    register: build.mutation<AuthResponse, Credentials>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(sessionStarted(data))
      },
    }),
    getMe: build.query<SessionUser, void>({
      query: () => '/auth/me',
      providesTags: [API_TAGS.me],
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi
