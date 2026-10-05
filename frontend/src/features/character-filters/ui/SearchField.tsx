import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useAppDispatch, useAppSelector } from '../../../shared/lib/store-hooks'
import { COLORS } from '../../../shared/theme/colors.constants'
import { searchChanged, selectCharacterFilters } from '../model/character-filters.slice'

const sideLine = {
  flex: 1,
  height: '1px',
  maxWidth: 180,
}

export function SearchField() {
  const dispatch = useAppDispatch()
  const { search } = useAppSelector(selectCharacterFilters)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <Box
        sx={{ ...sideLine, background: `linear-gradient(to right, transparent, ${COLORS.gray})` }}
      />
      <TextField
        value={search}
        onChange={(event) => dispatch(searchChanged(event.target.value))}
        placeholder="Search Characters..."
        size="small"
        inputProps={{ 'aria-label': 'Search characters' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          sx: { fontSize: 12, height: 32, bgcolor: 'background.paper' },
        }}
        sx={{ width: { xs: '100%', sm: 380 } }}
      />
      <Box
        sx={{ ...sideLine, background: `linear-gradient(to left, transparent, ${COLORS.gray})` }}
      />
    </Box>
  )
}
