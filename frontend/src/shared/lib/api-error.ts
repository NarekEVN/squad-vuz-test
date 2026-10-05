import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { NETWORK_ERROR_MESSAGE, UNKNOWN_ERROR_MESSAGE } from '../api/api.constants'
import { type ApiErrorBody, type FieldError } from '../api/api.types'

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function apiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!isFetchBaseQueryError(error) || typeof error.status !== 'number') {
    return undefined
  }
  const body = error.data as Partial<ApiErrorBody> | undefined
  return typeof body?.message === 'string' && typeof body.error === 'string'
    ? (body as ApiErrorBody)
    : undefined
}

export function apiErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error) && error.status === 'FETCH_ERROR') {
    return NETWORK_ERROR_MESSAGE
  }
  return apiErrorBody(error)?.message ?? UNKNOWN_ERROR_MESSAGE
}

export function apiFieldErrors(error: unknown): Record<string, string> {
  const body = apiErrorBody(error)
  if (body?.error !== 'VALIDATION_FAILED' || !Array.isArray(body.details)) {
    return {}
  }
  return Object.fromEntries(
    (body.details as FieldError[]).map((detail) => [detail.field, detail.errors[0] ?? '']),
  )
}
