import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../../shared/lib/store-hooks'
import { useCreateSquadMutation, useGetSquadQuery, useGetSquadsQuery } from '../api/squads.api'
import { activeSquadSelected, selectActiveSquadId } from './active-squad.slice'
import { DEFAULT_SQUAD_NAME } from './squad.constants'

export function useActiveSquad() {
  const dispatch = useAppDispatch()
  const storedId = useAppSelector(selectActiveSquadId)
  const squadsQuery = useGetSquadsQuery()
  const [createSquad] = useCreateSquadMutation()
  const creatingDefault = useRef(false)

  const squads = squadsQuery.data
  const activeId = squads?.find((squad) => squad.id === storedId)?.id ?? squads?.[0]?.id ?? null

  useEffect(() => {
    if (activeId !== storedId && squads) {
      dispatch(activeSquadSelected(activeId))
    }
  }, [activeId, storedId, squads, dispatch])

  useEffect(() => {
    if (squadsQuery.isSuccess && squads?.length === 0 && !creatingDefault.current) {
      creatingDefault.current = true
      createSquad({ name: DEFAULT_SQUAD_NAME })
        .unwrap()
        .then((squad) => dispatch(activeSquadSelected(squad.id)))
        .catch(() => undefined)
        .finally(() => {
          creatingDefault.current = false
        })
    }
  }, [squadsQuery.isSuccess, squads, createSquad, dispatch])

  const squadQuery = useGetSquadQuery(activeId ?? skipToken)

  return {
    squads: squads ?? [],
    squadId: activeId,
    squad: squadQuery.data,
    isLoading: squadsQuery.isLoading || squadQuery.isLoading || activeId === null,
    isError: squadsQuery.isError || squadQuery.isError,
    refetch: () => {
      squadsQuery.refetch()
      if (activeId) {
        squadQuery.refetch()
      }
    },
  }
}
