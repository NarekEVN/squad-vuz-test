export interface ApiErrorBody {
  statusCode: number
  error: string
  message: string
  details?: unknown
}

export interface FieldError {
  field: string
  errors: string[]
}
