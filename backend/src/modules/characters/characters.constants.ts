import { characters, universes } from '../../database/schema/index.js';

export const CHARACTER_SORT_FIELDS = ['name', 'id'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
export const TAG_MATCH_MODES = ['any', 'all'] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const SEARCH_MAX_LENGTH = 50;
export const FILTER_VALUE_MAX_LENGTH = 50;
export const FILTER_VALUES_MAX_COUNT = 25;
export const CURSOR_MAX_LENGTH = 512;

export const CHARACTER_BASE_COLUMNS = {
  id: characters.id,
  name: characters.name,
  quote: characters.quote,
  image: characters.image,
  thumbnail: characters.thumbnail,
  universe: universes.name,
};
