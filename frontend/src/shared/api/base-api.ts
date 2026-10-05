import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { API_URL } from '../config/env.constants'
import { sessionEnded } from '../model/session-events'
import { API_TAGS } from './api.constants'

interface StateWithToken {
  session?: { token: string | null }
}

function tokenFrom(state: unknown): string | null {
  return (state as StateWithToken).session?.token ?? null
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = tokenFrom(getState())
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && tokenFrom(api.getState())) {
    api.dispatch(sessionEnded())
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
})
