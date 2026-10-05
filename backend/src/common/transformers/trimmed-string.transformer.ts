import { type TransformFnParams } from 'class-transformer';

export function toTrimmedString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() || undefined : value;
}
