import { ROUTES } from '../../../shared/config/routes.constants'
import { type AuthFormCopy, type AuthMode } from './auth-form.types'

export const PASSWORD_MIN_LENGTH = 8

export const AUTH_FORM_COPY: Record<AuthMode, AuthFormCopy> = {
  login: {
    title: 'Welcome back, champion',
    submit: 'Log in',
    switchPrompt: 'New here?',
    switchLink: 'Create an account',
    switchTo: ROUTES.register,
  },
  register: {
    title: 'Join the fight for earthrealm',
    submit: 'Create account',
    switchPrompt: 'Already have an account?',
    switchLink: 'Log in',
    switchTo: ROUTES.login,
  },
}
