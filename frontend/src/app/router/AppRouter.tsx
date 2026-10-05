import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../pages/login/ui/LoginPage'
import { RegisterPage } from '../../pages/register/ui/RegisterPage'
import { SquadBuilderPage } from '../../pages/squad-builder/ui/SquadBuilderPage'
import { ROUTES } from '../../shared/config/routes.constants'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.home} element={<SquadBuilderPage />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
