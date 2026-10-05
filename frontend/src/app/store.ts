import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { activeSquadSlice } from '../entities/squad/model/active-squad.slice'
import { sessionSlice } from '../entities/session/model/session.slice'
import { characterFiltersSlice } from '../features/character-filters/model/character-filters.slice'
import { baseApi } from '../shared/api/base-api'
import { STORAGE_KEYS } from '../shared/config/storage.constants'
import { writeStorage } from '../shared/lib/storage'
import { notificationsSlice } from '../shared/model/notifications.slice'

const rootReducer = combineSlices(
  baseApi,
  sessionSlice,
  activeSquadSlice,
  characterFiltersSlice,
  notificationsSlice,
)

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

let persisted = { session: store.getState().session, squadId: store.getState().activeSquad.squadId }

store.subscribe(() => {
  const state = store.getState()
  if (state.session !== persisted.session) {
    writeStorage(STORAGE_KEYS.session, state.session.token ? state.session : null)
  }
  if (state.activeSquad.squadId !== persisted.squadId) {
    writeStorage(STORAGE_KEYS.activeSquad, state.activeSquad.squadId)
  }
  persisted = { session: state.session, squadId: state.activeSquad.squadId }
})
