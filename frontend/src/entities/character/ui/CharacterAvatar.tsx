import Avatar from '@mui/material/Avatar'
import { type Character } from '../model/character.types'

interface CharacterAvatarProps {
  character: Pick<Character, 'name' | 'thumbnail'>
  size?: number
}

export function CharacterAvatar({ character, size = 32 }: CharacterAvatarProps) {
  return (
    <Avatar
      src={character.thumbnail}
      alt={character.name}
      sx={{ width: size, height: size, bgcolor: 'background.default' }}
      imgProps={{ loading: 'lazy' }}
    >
      {character.name.charAt(0)}
    </Avatar>
  )
}
