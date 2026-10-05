import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { sessionEnded } from '../../../shared/model/session-events'
import { type CharacterFiltersState } from './character-filters.types'

const initialState: CharacterFiltersState = { search: '', tags: [], myTeam: false }

export const characterFiltersSlice = createSlice({
  name: 'characterFilters',
  initialState,
  reducers: {
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    tagToggled(state, action: PayloadAction<string>) {
      state.tags = state.tags.includes(action.payload)
        ? state.tags.filter((tag) => tag !== action.payload)
        : [...state.tags, action.payload]
    },
    myTeamToggled(state) {
      state.myTeam = !state.myTeam
    },
    filtersCleared() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionEnded, () => initialState)
  },
  selectors: {
    selectCharacterFilters: (state) => state,
    selectHasActiveFilters: (state) => state.search !== '' || state.tags.length > 0 || state.myTeam,
  },
})

export const { searchChanged, tagToggled, myTeamToggled, filtersCleared } =
  characterFiltersSlice.actions
export const { selectCharacterFilters, selectHasActiveFilters } = characterFiltersSlice.selectors
