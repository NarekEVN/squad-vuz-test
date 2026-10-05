import { type AbilityName } from '../../database/database.types.js';
import {
  type CHARACTER_SORT_FIELDS,
  type SORT_ORDERS,
  type TAG_MATCH_MODES,
} from './characters.constants.js';

export type CharacterSortField = (typeof CHARACTER_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
export type TagMatchMode = (typeof TAG_MATCH_MODES)[number];

export interface CharacterFilters {
  search?: string;
  tags?: string[];
  tagMatch: TagMatchMode;
  universes?: string[];
}

export interface CharacterKeyset {
  name: string;
  id: number;
}

export interface CharacterPageRequest {
  filters: CharacterFilters;
  sort: CharacterSortField;
  order: SortOrder;
  limit: number;
  after?: CharacterKeyset;
}

export interface CharacterCursor extends CharacterKeyset {
  sort: CharacterSortField;
  order: SortOrder;
}

export interface CharacterBaseRow {
  id: number;
  name: string;
  quote: string | null;
  image: string;
  thumbnail: string | null;
  universe: string;
}

export interface CharacterTagRow {
  characterId: number;
  name: string;
}

export interface CharacterAbilityRow {
  characterId: number;
  ability: AbilityName;
  score: number;
}

export interface FilterOptionRow {
  name: string;
  count: number;
}
