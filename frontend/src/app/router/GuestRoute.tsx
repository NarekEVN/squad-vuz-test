import { Navigate, Outlet } from 'react-router-dom'
import { selectIsAuthenticated } from '../../entities/session/model/session.slice'
import { ROUTES } from '../../shared/config/routes.constants'
import { useAppSelector } from '../../shared/lib/store-hooks'

export function GuestRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return isAuthenticated ? <Navigate to={ROUTES.home} replace /> : <Outlet />
}
