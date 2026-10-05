import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { memo } from 'react'
import { abilityScore } from '../../../entities/character/lib/ability-score'
import {
  ABILITY_COLUMNS,
  MAX_ABILITY_SCORE,
} from '../../../entities/character/model/character.constants'
import { type Character } from '../../../entities/character/model/character.types'
import { CharacterAvatar } from '../../../entities/character/ui/CharacterAvatar'
import { MemberCheckbox } from '../../../features/toggle-squad-member/ui/MemberCheckbox'
import { COLORS } from '../../../shared/theme/colors.constants'
import { TagChip } from '../../../shared/ui/TagChip'
import { TABLE_COLUMNS } from '../model/characters-table.constants'

interface CharacterRowProps {
  character: Character
  squadId: string | null
  inSquad: boolean
}

export const CharacterRow = memo(function CharacterRow({
  character,
  squadId,
  inSquad,
}: CharacterRowProps) {
  return (
    <Box
      role="row"
      aria-selected={inSquad}
      sx={{
        display: 'grid',
        gridTemplateColumns: TABLE_COLUMNS,
        alignItems: 'center',
        minHeight: 56,
        px: 1,
        bgcolor: inSquad ? COLORS.selectedRow : 'background.paper',
        borderBottom: `1px solid ${COLORS.divider}`,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box role="cell">
        <MemberCheckbox character={character} squadId={squadId} checked={inSquad} />
      </Box>
      <Box role="cell" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <CharacterAvatar character={character} />
        <Typography sx={{ fontSize: 14, fontWeight: 500 }} noWrap>
          {character.name}
        </Typography>
      </Box>
      <Box role="cell" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', py: 1 }}>
        {character.tags.map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
      </Box>
      {ABILITY_COLUMNS.map((ability) => {
        const score = abilityScore(character, ability)
        return (
          <Typography
            key={ability}
            role="cell"
            sx={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 500,
              color: score === MAX_ABILITY_SCORE ? 'error.main' : 'text.primary',
            }}
          >
            {score ?? '-'}
          </Typography>
        )
      })}
    </Box>
  )
})
