import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { toStringList } from '../../../common/transformers/string-list.transformer.js';
import { toTrimmedString } from '../../../common/transformers/trimmed-string.transformer.js';
import {
  CHARACTER_SORT_FIELDS,
  CURSOR_MAX_LENGTH,
  DEFAULT_PAGE_SIZE,
  FILTER_VALUE_MAX_LENGTH,
  FILTER_VALUES_MAX_COUNT,
  MAX_PAGE_SIZE,
  SEARCH_MAX_LENGTH,
  SORT_ORDERS,
  TAG_MATCH_MODES,
} from '../characters.constants.js';
import {
  type CharacterSortField,
  type SortOrder,
  type TagMatchMode,
} from '../characters.types.js';

export class ListCharactersQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive substring of the name',
    example: 'goku',
  })
  @IsOptional()
  @Transform(toTrimmedString)
  @IsString()
  @MaxLength(SEARCH_MAX_LENGTH)
  search?: string;

  @ApiPropertyOptional({
    description: 'Tag names, comma-separated or repeated',
    type: [String],
    example: ['alien', 'strong'],
  })
  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(FILTER_VALUES_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(FILTER_VALUE_MAX_LENGTH, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Match characters with any of the tags, or all of them',
    enum: TAG_MATCH_MODES,
    default: 'any',
  })
  @IsOptional()
  @IsIn(TAG_MATCH_MODES)
  tagMatch: TagMatchMode = 'any';

  @ApiPropertyOptional({
    description: 'Universe names, comma-separated or repeated',
    type: [String],
    example: ['Dragon Ball Z'],
  })
  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(FILTER_VALUES_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(FILTER_VALUE_MAX_LENGTH, { each: true })
  universe?: string[];

  @ApiPropertyOptional({ enum: CHARACTER_SORT_FIELDS, default: 'name' })
  @IsOptional()
  @IsIn(CHARACTER_SORT_FIELDS)
  sort: CharacterSortField = 'name';

  @ApiPropertyOptional({ enum: SORT_ORDERS, default: 'asc' })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = 'asc';

  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ description: 'nextCursor from the previous page' })
  @IsOptional()
  @IsString()
  @MaxLength(CURSOR_MAX_LENGTH)
  cursor?: string;
}
