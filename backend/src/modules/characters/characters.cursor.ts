import { z } from 'zod';
import {
  decodeCursor,
  encodeCursor,
  invalidCursor,
} from '../../common/utils/pagination.util.js';
import { CHARACTER_SORT_FIELDS, SORT_ORDERS } from './characters.constants.js';
import {
  type CharacterCursor,
  type CharacterKeyset,
  type CharacterSortField,
  type SortOrder,
} from './characters.types.js';

const characterCursorSchema: z.ZodType<CharacterCursor> = z.object({
  sort: z.enum(CHARACTER_SORT_FIELDS),
  order: z.enum(SORT_ORDERS),
  name: z.string(),
  id: z.number().int(),
});

export function encodeCharacterCursor(cursor: CharacterCursor): string {
  return encodeCursor(cursor);
}

export function keysetFromCursor(
  cursor: string,
  sort: CharacterSortField,
  order: SortOrder,
): CharacterKeyset {
  const decoded = decodeCursor(cursor, characterCursorSchema);
  if (decoded.sort !== sort || decoded.order !== order) {
    throw invalidCursor();
  }
  return { name: decoded.name, id: decoded.id };
}
