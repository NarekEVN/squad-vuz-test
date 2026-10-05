import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useLoginMutation, useRegisterMutation } from '../../../entities/session/api/auth.api'
import { ROUTES } from '../../../shared/config/routes.constants'
import { apiErrorMessage, apiFieldErrors } from '../../../shared/lib/api-error'
import { AUTH_FORM_COPY, PASSWORD_MIN_LENGTH } from '../model/auth-form.constants'
import { type AuthMode } from '../model/auth-form.types'

interface AuthFormProps {
  mode: AuthMode
}

export function AuthForm({ mode }: AuthFormProps) {
  const copy = AUTH_FORM_COPY[mode]
  const navigate = useNavigate()
  const [login, loginState] = useLoginMutation()
  const [register, registerState] = useRegisterMutation()
  const { isLoading, error } = mode === 'login' ? loginState : registerState
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const fieldErrors = apiFieldErrors(error)
  const formError = error && Object.keys(fieldErrors).length === 0 ? apiErrorMessage(error) : null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const submitCredentials = mode === 'login' ? login : register
    const result = await submitCredentials({ email, password })
    if ('data' in result) {
      navigate(ROUTES.home, { replace: true })
    }
  }

  return (
    <Paper
      component="form"
      onSubmit={submit}
      noValidate
      sx={{ p: 4, width: '100%', maxWidth: 400 }}
    >
      <Stack spacing={2.5}>
        <Typography variant="h6" component="h1" textAlign="center" fontWeight={500}>
          {copy.title}
        </Typography>
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          required
          autoFocus
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={
            fieldErrors.password ??
            (mode === 'register' ? `At least ${PASSWORD_MIN_LENGTH} characters` : undefined)
          }
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={isLoading}>
          {isLoading ? 'Please wait…' : copy.submit}
        </Button>
        <Typography variant="body2" textAlign="center" color="text.secondary">
          {copy.switchPrompt}{' '}
          <Link component={RouterLink} to={copy.switchTo}>
            {copy.switchLink}
          </Link>
        </Typography>
      </Stack>
    </Paper>
  )
}
