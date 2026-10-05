import Stack from '@mui/material/Stack'
import { SearchField } from '../../../features/character-filters/ui/SearchField'
import { TagFilters } from '../../../features/character-filters/ui/TagFilters'

export function CharacterFiltersPanel() {
  return (
    <Stack component="section" aria-label="Filters" spacing={4} alignItems="center">
      <SearchField />
      <TagFilters />
    </Stack>
  )
}
