import { ApiProperty } from '@nestjs/swagger';
import { ABILITY_NAMES } from '../../../database/database.constants.js';
import { type AbilityName } from '../../../database/database.types.js';
import { CHARACTER_SORT_FIELDS } from '../characters.constants.js';
import { type CharacterSortField } from '../characters.types.js';
import { FilterOptionDto } from './filter-option.dto.js';

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
