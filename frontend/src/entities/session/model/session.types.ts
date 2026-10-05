export interface SessionUser {
  id: string
  email: string
  createdAt: string
}

export interface SessionState {
  token: string | null
  user: SessionUser | null
}

export interface AuthResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: SessionUser
}

export interface Credentials {
  email: string
  password: string
}
