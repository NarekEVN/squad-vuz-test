import { useCallback } from 'react'
import { type Character } from '../../../entities/character/model/character.types'
import {
  useAddSquadMemberMutation,
  useRemoveSquadMemberMutation,
} from '../../../entities/squad/api/squads.api'
import { apiErrorMessage } from '../../../shared/lib/api-error'
import { useAppDispatch } from '../../../shared/lib/store-hooks'
import { notified } from '../../../shared/model/notifications.slice'

export function useSquadMemberToggle(squadId: string | null) {
  const dispatch = useAppDispatch()
  const [addMember] = useAddSquadMemberMutation()
  const [removeMember] = useRemoveSquadMemberMutation()

  const run = useCallback(
    (mutation: typeof addMember, character: Character) => {
      if (!squadId) {
        return
      }
      mutation({ squadId, character })
        .unwrap()
        .catch((error: unknown) => dispatch(notified(apiErrorMessage(error))))
    },
    [squadId, dispatch],
  )

  return {
    add: (character: Character) => run(addMember, character),
    remove: (character: Character) => run(removeMember, character),
  }
}
