import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { type Character } from '../../../entities/character/model/character.types'
import { CharacterAvatar } from '../../../entities/character/ui/CharacterAvatar'
import { COLORS } from '../../../shared/theme/colors.constants'
import { MEMBER_AVATAR_SIZE } from '../model/squad-overview.constants'

interface MemberAvatarProps {
  character: Character
  onRemove: () => void
}

export function MemberAvatar({ character, onRemove }: MemberAvatarProps) {
  return (
    <ButtonBase
      onClick={onRemove}
      aria-label={`Remove ${character.name} from squad`}
      title={character.name}
      sx={{
        position: 'relative',
        borderRadius: '50%',
        border: `2px solid ${COLORS.white}`,
        boxShadow: 1,
        '&:hover .remove-overlay, &:focus-visible .remove-overlay': { opacity: 1 },
      }}
    >
      <CharacterAvatar character={character} size={MEMBER_AVATAR_SIZE} />
      <Box
        className="remove-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          bgcolor: COLORS.primaryOverlay,
          color: 'common.white',
          fontSize: 14,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 150ms',
        }}
      >
        Remove
      </Box>
    </ButtonBase>
  )
}
