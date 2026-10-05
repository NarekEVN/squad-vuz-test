import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '../../../shared/config/storage.constants'
import { readStorage } from '../../../shared/lib/storage'
import { sessionEnded } from '../../../shared/model/session-events'
import { type ActiveSquadState } from './squad.types'

export const activeSquadSlice = createSlice({
  name: 'activeSquad',
  initialState: (): ActiveSquadState => ({
    squadId: readStorage<string>(STORAGE_KEYS.activeSquad) ?? null,
  }),
  reducers: {
    activeSquadSelected(state, action: PayloadAction<string | null>) {
      state.squadId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => ({ squadId: null }))
  },
  selectors: {
    selectActiveSquadId: (state) => state.squadId,
  },
})

export const { activeSquadSelected } = activeSquadSlice.actions
export const { selectActiveSquadId } = activeSquadSlice.selectors
