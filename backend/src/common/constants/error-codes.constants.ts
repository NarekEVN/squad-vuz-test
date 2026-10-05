export const ErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  Unauthorized: 'UNAUTHORIZED',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  EmailTaken: 'EMAIL_TAKEN',
  InvalidCursor: 'INVALID_CURSOR',
  InvalidId: 'INVALID_ID',
  CharacterNotFound: 'CHARACTER_NOT_FOUND',
  UnknownCharacters: 'UNKNOWN_CHARACTERS',
  SquadNotFound: 'SQUAD_NOT_FOUND',
  SquadFull: 'SQUAD_FULL',
  CharacterAlreadyInSquad: 'CHARACTER_ALREADY_IN_SQUAD',
  CharacterNotInSquad: 'CHARACTER_NOT_IN_SQUAD',
  SquadNameTaken: 'SQUAD_NAME_TAKEN',
  SquadLimitReached: 'SQUAD_LIMIT_REACHED',
} as const;

export const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
