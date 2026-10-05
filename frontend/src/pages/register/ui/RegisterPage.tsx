import { AuthForm } from '../../../features/auth/ui/AuthForm'
import { AuthLayout } from '../../auth-layout/ui/AuthLayout'

export function RegisterPage() {
  return (
    <AuthLayout>
      <AuthForm mode="register" />
    </AuthLayout>
  )
}
