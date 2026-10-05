import { ApiProperty } from '@nestjs/swagger';
import { AbilityStatDto } from './ability-stat.dto.js';

export class SquadStatsDto {
  @ApiProperty({ example: 3 })
  memberCount: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 5.8,
    description: 'Average of every ability score in the squad',
  })
  overallAverage: number | null;

  @ApiProperty({ type: [AbilityStatDto] })
  abilities: AbilityStatDto[];
}
