import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  PICK_STATS_DEFAULT_DAYS,
  PICK_STATS_MAX_DAYS,
} from '../activity.constants.js';

export class PickStatsQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: PICK_STATS_MAX_DAYS,
    default: PICK_STATS_DEFAULT_DAYS,
    description: 'Look-back window in days',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PICK_STATS_MAX_DAYS)
  days: number = PICK_STATS_DEFAULT_DAYS;
}
