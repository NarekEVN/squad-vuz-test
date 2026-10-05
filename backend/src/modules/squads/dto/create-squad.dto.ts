import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { toTrimmedString } from '../../../common/transformers/trimmed-string.transformer.js';
import { SQUAD_MAX_MEMBERS } from '../../../database/database.constants.js';
import {
  CHARACTER_IDS_MAX_COUNT,
  SQUAD_NAME_MAX_LENGTH,
} from '../squads.constants.js';

export class CreateSquadDto {
  @ApiProperty({ example: 'Saiyan Pride', maxLength: SQUAD_NAME_MAX_LENGTH })
  @Transform(toTrimmedString)
  @IsString()
  @MaxLength(SQUAD_NAME_MAX_LENGTH)
  name: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: `Up to ${SQUAD_MAX_MEMBERS} distinct character ids, in slot order`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(CHARACTER_IDS_MAX_COUNT)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  characterIds?: number[];
}
