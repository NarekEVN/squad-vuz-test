import { type Character } from '../../character/model/character.types'
import { SQUAD_MAX_MEMBERS } from '../model/squad.constants'
import { type Squad } from '../model/squad.types'

function firstFreePosition(squad: Squad): number | undefined {
  const taken = new Set(squad.members.map((member) => member.position))
  for (let position = 1; position <= SQUAD_MAX_MEMBERS; position += 1) {
    if (!taken.has(position)) {
      return position
    }
  }
  return undefined
}

export function withMemberAdded(squad: Squad, character: Character): Squad {
  const position = firstFreePosition(squad)
  if (position === undefined || squad.members.some((m) => m.character.id === character.id)) {
    return squad
  }
  return {
    ...squad,
    members: [...squad.members, { position, character }].sort((a, b) => a.position - b.position),
  }
}

export function withMemberRemoved(squad: Squad, characterId: number): Squad {
  return {
    ...squad,
    members: squad.members.filter((member) => member.character.id !== characterId),
  }
}
