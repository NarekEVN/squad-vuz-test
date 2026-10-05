import Checkbox from '@mui/material/Checkbox'
import { type Character } from '../../../entities/character/model/character.types'
import { useSquadMemberToggle } from '../model/use-squad-member-toggle'

interface MemberCheckboxProps {
  character: Character
  squadId: string | null
  checked: boolean
}

export function MemberCheckbox({ character, squadId, checked }: MemberCheckboxProps) {
  const { add, remove } = useSquadMemberToggle(squadId)

  return (
    <Checkbox
      checked={checked}
      disabled={!squadId}
      onChange={() => (checked ? remove(character) : add(character))}
      inputProps={{
        'aria-label': checked
          ? `Remove ${character.name} from squad`
          : `Add ${character.name} to squad`,
      }}
      size="small"
    />
  )
}
