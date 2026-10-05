import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams, Type } from 'class-transformer';
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

export const CHARACTER_SORT_FIELDS = ['name', 'id'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
export const TAG_MATCH_MODES = ['any', 'all'] as const;

export type CharacterSortField = (typeof CHARACTER_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
export type TagMatchMode = (typeof TAG_MATCH_MODES)[number];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

function toTrimmedString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() || undefined : value;
}

function toStringList({ value }: TransformFnParams): unknown {
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

export class ListCharactersQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive substring of the name',
    example: 'goku',
  })
  @IsOptional()
  @Transform(toTrimmedString)
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({
    description: 'Tag names, comma-separated or repeated',
    type: [String],
    example: ['alien', 'strong'],
  })
  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(25)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
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
  @ArrayMaxSize(25)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
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

  @ApiPropertyOptional({
    description: 'nextCursor from the previous page',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  cursor?: string;
}
