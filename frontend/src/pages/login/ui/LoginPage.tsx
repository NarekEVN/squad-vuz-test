import { AuthForm } from '../../../features/auth/ui/AuthForm'
import { AuthLayout } from '../../auth-layout/ui/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout>
      <AuthForm mode="login" />
    </AuthLayout>
  )
}
