import { ApiProperty } from '@nestjs/swagger';
import { ABILITY_NAMES } from '../../../database/database.constants.js';
import { type AbilityName } from '../../../database/database.types.js';

export class AbilityStatDto {
  @ApiProperty({ enum: ABILITY_NAMES, example: 'Power' })
  name: AbilityName;

  @ApiProperty({ type: Number, nullable: true, example: 6.33 })
  average: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 2 })
  min: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 10 })
  max: number | null;
}
