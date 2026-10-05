import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ABILITY_NAMES,
  type AbilityName,
} from '../../../database/schema/index.js';
import {
  CHARACTER_SORT_FIELDS,
  type CharacterSortField,
} from './list-characters-query.dto.js';

export class CharacterAbilityDto {
  @ApiProperty({ enum: ABILITY_NAMES, example: 'Power' })
  name: AbilityName;

  @ApiProperty({ minimum: 1, maximum: 10, example: 7 })
  score: number;
}

export class CharacterDto {
  @ApiProperty({ example: 208 })
  id: number;

  @ApiProperty({ example: 'Baraka' })
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: "Speak. You've earned the chance.",
  })
  quote: string | null;

  @ApiProperty({ format: 'uri' })
  image: string;

  @ApiProperty({
    format: 'uri',
    description: 'Falls back to image when the source has no thumbnail',
  })
  thumbnail: string;

  @ApiProperty({ example: 'Mortal Kombat' })
  universe: string;

  @ApiProperty({ type: [String], example: ['monster', 'melee'] })
  tags: string[];

  @ApiProperty({ type: [CharacterAbilityDto] })
  abilities: CharacterAbilityDto[];
}

export class CharacterListResponseDto {
  @ApiProperty({ type: [CharacterDto] })
  items: CharacterDto[];

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Pass as cursor to get the next page; null on the last page',
  })
  nextCursor: string | null;

  @ApiProperty({ description: 'Characters matching the filters', example: 44 })
  total: number;
}

export class FilterOptionDto {
  @ApiProperty({ example: 'alien' })
  name: string;

  @ApiProperty({ example: 40 })
  count: number;
}

export class CharacterFiltersResponseDto {
  @ApiProperty({ type: [FilterOptionDto] })
  universes: FilterOptionDto[];

  @ApiProperty({ type: [FilterOptionDto] })
  tags: FilterOptionDto[];

  @ApiProperty({ enum: ABILITY_NAMES, isArray: true })
  abilities: AbilityName[];

  @ApiProperty({ enum: CHARACTER_SORT_FIELDS, isArray: true })
  sortFields: CharacterSortField[];
}
