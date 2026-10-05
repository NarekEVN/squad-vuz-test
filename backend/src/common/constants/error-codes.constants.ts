export const ErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  Unauthorized: 'UNAUTHORIZED',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  EmailTaken: 'EMAIL_TAKEN',
  InvalidCursor: 'INVALID_CURSOR',
  InvalidId: 'INVALID_ID',
  CharacterNotFound: 'CHARACTER_NOT_FOUND',
} as const;

export const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
