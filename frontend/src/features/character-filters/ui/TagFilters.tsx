import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import { useGetCharacterFilterOptionsQuery } from '../../../entities/character/api/characters.api'
import { useAppDispatch, useAppSelector } from '../../../shared/lib/store-hooks'
import { TagChip } from '../../../shared/ui/TagChip'
import {
  filtersCleared,
  myTeamToggled,
  selectCharacterFilters,
  selectHasActiveFilters,
  tagToggled,
} from '../model/character-filters.slice'

const SKELETON_CHIPS = 12

export function TagFilters() {
  const dispatch = useAppDispatch()
  const { tags, myTeam } = useAppSelector(selectCharacterFilters)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  const { data, isLoading } = useGetCharacterFilterOptionsQuery()

  return (
    <Box
      role="group"
      aria-label="Filter by tag"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading
        ? Array.from({ length: SKELETON_CHIPS }, (_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={64}
              height={24}
              sx={{ borderRadius: 3 }}
            />
          ))
        : data?.tags.map((tag) => (
            <TagChip
              key={tag.name}
              label={tag.name}
              selected={tags.includes(tag.name)}
              onClick={() => dispatch(tagToggled(tag.name))}
            />
          ))}
      <TagChip label="My Team" selected={myTeam} onClick={() => dispatch(myTeamToggled())} />
      <Link
        component="button"
        type="button"
        onClick={() => dispatch(filtersCleared())}
        disabled={!hasActiveFilters}
        sx={{ fontSize: 12, color: 'text.secondary', textDecorationColor: 'inherit', ml: 1 }}
      >
        Clear all
      </Link>
    </Box>
  )
}
