import { BadRequestException } from '@nestjs/common';
import { type ValidationError } from 'class-validator';

export interface FieldError {
  field: string;
  errors: string[];
}

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own: FieldError[] = error.constraints
      ? [{ field, errors: Object.values(error.constraints) }]
      : [];
    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });
}

export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    error: 'VALIDATION_FAILED',
    message: 'Request validation failed',
    details: flattenValidationErrors(errors),
  });
}
