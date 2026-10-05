import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { API_TAGS } from '../../../shared/api/api.constants'
import { baseApi } from '../../../shared/api/base-api'
import { REALTIME_URL } from '../../../shared/config/env.constants'
import { useAppDispatch } from '../../../shared/lib/store-hooks'
import { REALTIME_NAMESPACE, ServerEvent } from './realtime.constants'
import { connectionChanged, popularityReceived } from './realtime.slice'
import { type PopularityMessage, type SquadChangedMessage } from './realtime.types'

export function useRealtimeSync(token: string | null): void {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!token) {
      return undefined
    }
    const socket = io(`${REALTIME_URL}${REALTIME_NAMESPACE}`, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => dispatch(connectionChanged(true)))
    socket.on('disconnect', () => dispatch(connectionChanged(false)))
    socket.on(ServerEvent.SquadChanged, ({ squadId }: SquadChangedMessage) => {
      dispatch(
        baseApi.util.invalidateTags([API_TAGS.squadList, { type: API_TAGS.squad, id: squadId }]),
      )
    })
    socket.on(ServerEvent.PopularityUpdated, (message: PopularityMessage) => {
      dispatch(popularityReceived(message))
    })

    return () => {
      socket.disconnect()
      dispatch(connectionChanged(false))
    }
  }, [token, dispatch])
}
