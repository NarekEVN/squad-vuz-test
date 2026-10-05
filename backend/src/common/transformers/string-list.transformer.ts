import { type TransformFnParams } from 'class-transformer';

export function toStringList({ value }: TransformFnParams): unknown {
  const items = (Array.isArray(value) ? value : [value]) as unknown[];
  if (!items.every((item) => typeof item === 'string')) {
    return value;
  }
  const values = items
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? [...new Set(values)].sort() : undefined;
}
