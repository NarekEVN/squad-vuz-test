import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '../../../shared/config/storage.constants'
import { readStorage } from '../../../shared/lib/storage'
import { sessionEnded } from '../../../shared/model/session-events'
import { type AuthResponse, type SessionState } from './session.types'

const emptySession: SessionState = { token: null, user: null }

export const sessionSlice = createSlice({
  name: 'session',
  initialState: (): SessionState => readStorage<SessionState>(STORAGE_KEYS.session) ?? emptySession,
  reducers: {
    sessionStarted(state, action: PayloadAction<AuthResponse>) {
      state.token = action.payload.accessToken
      state.user = action.payload.user
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => emptySession)
  },
  selectors: {
    selectIsAuthenticated: (state) => state.token !== null,
    selectSessionUser: (state) => state.user,
    selectSessionToken: (state) => state.token,
  },
})

export const { sessionStarted } = sessionSlice.actions
export const { selectIsAuthenticated, selectSessionUser, selectSessionToken } =
  sessionSlice.selectors
