import { ApiProperty } from '@nestjs/swagger';
import { SquadMemberDto } from './squad-member.dto.js';
import { SquadStatsDto } from './squad-stats.dto.js';

export class SquadDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Saiyan Pride' })
  name: string;

  @ApiProperty({ type: [SquadMemberDto], description: 'Ordered by position' })
  members: SquadMemberDto[];

  @ApiProperty({ type: SquadStatsDto })
  stats: SquadStatsDto;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
