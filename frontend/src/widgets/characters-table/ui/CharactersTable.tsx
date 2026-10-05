import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo } from 'react'
import { ABILITY_COLUMNS } from '../../../entities/character/model/character.constants'
import { type Squad } from '../../../entities/squad/model/squad.types'
import { filtersCleared } from '../../../features/character-filters/model/character-filters.slice'
import { useAppDispatch } from '../../../shared/lib/store-hooks'
import { useNearViewport } from '../../../shared/lib/use-near-viewport'
import {
  LOAD_MORE_MARGIN_PX,
  TABLE_COLUMNS,
  TABLE_MIN_WIDTH,
} from '../model/characters-table.constants'
import { useVisibleCharacters } from '../model/use-visible-characters'
import { CharacterRow } from './CharacterRow'
import { CharactersTableSkeleton } from './CharactersTableSkeleton'
import { TableMessage } from './TableMessage'

interface CharactersTableProps {
  squad: Squad | undefined
}

const headerCell = { fontSize: 14, fontWeight: 500 }

export function CharactersTable({ squad }: CharactersTableProps) {
  const dispatch = useAppDispatch()
  const visible = useVisibleCharacters(squad)
  const [sentinelRef, isSentinelNear, scrollTick] =
    useNearViewport<HTMLDivElement>(LOAD_MORE_MARGIN_PX)
  const { characters, hasMore, isFetchingMore, isLoading, loadMore } = visible

  useEffect(() => {
    if (hasMore && !isFetchingMore && !isLoading && isSentinelNear()) {
      loadMore()
    }
  }, [characters.length, scrollTick, hasMore, isFetchingMore, isLoading, loadMore, isSentinelNear])
  const memberIds = useMemo(
    () => new Set((squad?.members ?? []).map((member) => member.character.id)),
    [squad],
  )

  const renderBody = () => {
    if (visible.isLoading) {
      return <CharactersTableSkeleton />
    }
    if (visible.isError) {
      return (
        <TableMessage
          title="Couldn't load characters"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={visible.retry}
        />
      )
    }
    if (visible.characters.length === 0) {
      return (
        <TableMessage
          title="No champions match your filters"
          actionLabel="Clear all filters"
          onAction={() => dispatch(filtersCleared())}
        />
      )
    }
    return visible.characters.map((character) => (
      <CharacterRow
        key={character.id}
        character={character}
        squadId={squad?.id ?? null}
        inSquad={memberIds.has(character.id)}
      />
    ))
  }

  return (
    <Box component="section" aria-label="Characters" sx={{ width: '100%', overflowX: 'auto' }}>
      <Box role="table" aria-rowcount={visible.total} sx={{ minWidth: TABLE_MIN_WIDTH }}>
        <Box
          role="row"
          sx={{ display: 'grid', gridTemplateColumns: TABLE_COLUMNS, px: 1, pb: 1.5 }}
        >
          <Box role="columnheader" />
          <Typography role="columnheader" sx={headerCell}>
            Character
          </Typography>
          <Typography role="columnheader" sx={headerCell}>
            Tags
          </Typography>
          {ABILITY_COLUMNS.map((ability) => (
            <Typography
              key={ability}
              role="columnheader"
              sx={{ ...headerCell, textAlign: 'center' }}
            >
              {ability}
            </Typography>
          ))}
        </Box>
        <Paper elevation={2} sx={{ overflow: 'hidden' }}>
          {renderBody()}
        </Paper>
        <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          {visible.isFetchingMore && <CircularProgress size={24} aria-label="Loading more" />}
        </Box>
      </Box>
    </Box>
  )
}
