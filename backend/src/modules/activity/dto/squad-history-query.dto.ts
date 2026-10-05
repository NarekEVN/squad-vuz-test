import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  HISTORY_DEFAULT_LIMIT,
  HISTORY_MAX_LIMIT,
} from '../activity.constants.js';

export class SquadHistoryQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: HISTORY_MAX_LIMIT,
    default: HISTORY_DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(HISTORY_MAX_LIMIT)
  limit: number = HISTORY_DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: 'nextCursor from the previous page' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  cursor?: string;
}
