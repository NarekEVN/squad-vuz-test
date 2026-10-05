import { BadRequestException } from '@nestjs/common';
import { type z } from 'zod';

export function encodeCursor(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor<T>(cursor: string, schema: z.ZodType<T>): T {
  try {
    return schema.parse(
      JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')),
    );
  } catch {
    throw invalidCursor();
  }
}

export function invalidCursor(): BadRequestException {
  return new BadRequestException('The pagination cursor is invalid', {
    description: 'INVALID_CURSOR',
  });
}
