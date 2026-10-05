import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { CharacterAvatar } from '../../../entities/character/ui/CharacterAvatar'
import {
  selectPopularity,
  selectRealtimeConnected,
} from '../../../features/realtime-sync/model/realtime.slice'
import { useAppSelector } from '../../../shared/lib/store-hooks'
import { COLORS } from '../../../shared/theme/colors.constants'
import {
  LIVE_COLOR,
  LIVE_DOT_SIZE,
  VISIBLE_POPULAR_CHARACTERS,
} from '../model/live-popularity.constants'

export function LivePopularity() {
  const popularity = useAppSelector(selectPopularity)
  const connected = useAppSelector(selectRealtimeConnected)
  const characters = popularity?.characters.slice(0, VISIBLE_POPULAR_CHARACTERS) ?? []

  if (characters.length === 0) {
    return null
  }

  return (
    <Box
      component="section"
      aria-label="Most picked right now"
      aria-live="polite"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <Tooltip title={connected ? 'Live' : 'Reconnecting…'}>
        <Box
          sx={{
            width: LIVE_DOT_SIZE,
            height: LIVE_DOT_SIZE,
            borderRadius: '50%',
            bgcolor: connected ? LIVE_COLOR : COLORS.gray,
          }}
        />
      </Tooltip>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mr: 0.5 }}>
        Most picked right now
      </Typography>
      {characters.map((character) => (
        <Chip
          key={character.characterId}
          size="small"
          variant="outlined"
          avatar={<CharacterAvatar character={character} size={20} />}
          label={`${character.name} · ${character.picks}`}
          sx={{ borderColor: COLORS.divider }}
        />
      ))}
    </Box>
  )
}
