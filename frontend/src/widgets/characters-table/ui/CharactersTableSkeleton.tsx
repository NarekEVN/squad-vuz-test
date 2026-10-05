import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { ABILITY_COLUMNS } from '../../../entities/character/model/character.constants'
import { COLORS } from '../../../shared/theme/colors.constants'
import { SKELETON_ROWS, TABLE_COLUMNS } from '../model/characters-table.constants'

export function CharactersTableSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading characters">
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <Box
          key={row}
          sx={{
            display: 'grid',
            gridTemplateColumns: TABLE_COLUMNS,
            alignItems: 'center',
            gap: 1,
            minHeight: 56,
            px: 1.5,
            borderBottom: `1px solid ${COLORS.divider}`,
          }}
        >
          <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton width="60%" />
          </Box>
          <Skeleton width="70%" />
          {ABILITY_COLUMNS.map((ability) => (
            <Skeleton key={ability} width={20} sx={{ mx: 'auto' }} />
          ))}
        </Box>
      ))}
    </Box>
  )
}
