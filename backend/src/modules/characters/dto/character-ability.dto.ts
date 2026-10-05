import { ApiProperty } from '@nestjs/swagger';
import { ABILITY_NAMES } from '../../../database/database.constants.js';
import { type AbilityName } from '../../../database/database.types.js';

export class CharacterAbilityDto {
  @ApiProperty({ enum: ABILITY_NAMES, example: 'Power' })
  name: AbilityName;

  @ApiProperty({ minimum: 1, maximum: 10, example: 7 })
  score: number;
}
