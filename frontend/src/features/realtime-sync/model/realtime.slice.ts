import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { sessionEnded } from '../../../shared/model/session-events'
import { type PopularityMessage, type RealtimeState } from './realtime.types'

const initialState: RealtimeState = { connected: false, popularity: null }

export const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    connectionChanged(state, action: PayloadAction<boolean>) {
      state.connected = action.payload
    },
    popularityReceived(state, action: PayloadAction<PopularityMessage>) {
      state.popularity = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => initialState)
  },
  selectors: {
    selectRealtimeConnected: (state) => state.connected,
    selectPopularity: (state) => state.popularity,
  },
})

export const { connectionChanged, popularityReceived } = realtimeSlice.actions
export const { selectRealtimeConnected, selectPopularity } = realtimeSlice.selectors
