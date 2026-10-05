import { selectSessionToken } from '../../../entities/session/model/session.slice'
import { useAppSelector } from '../../../shared/lib/store-hooks'
import { useRealtimeSync } from '../model/use-realtime-sync'

export function RealtimeSync() {
  const token = useAppSelector(selectSessionToken)
  useRealtimeSync(token)
  return null
}
