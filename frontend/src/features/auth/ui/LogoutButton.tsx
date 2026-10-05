import Button from '@mui/material/Button'
import { baseApi } from '../../../shared/api/base-api'
import { useAppDispatch } from '../../../shared/lib/store-hooks'
import { sessionEnded } from '../../../shared/model/session-events'

export function LogoutButton() {
  const dispatch = useAppDispatch()

  const logout = () => {
    dispatch(sessionEnded())
    dispatch(baseApi.util.resetApiState())
  }

  return (
    <Button onClick={logout} size="small" sx={{ color: 'common.white' }}>
      Log out
    </Button>
  )
}
