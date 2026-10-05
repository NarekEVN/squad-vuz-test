import { ApiProperty } from '@nestjs/swagger';
import { CharacterPickStatDto } from './character-pick-stat.dto.js';
import { DailyPickStatDto } from './daily-pick-stat.dto.js';
import { PickTotalsDto } from './pick-totals.dto.js';

export class PickStatsResponseDto {
  @ApiProperty({ format: 'date-time', description: 'Start of the window' })
  since: string;

  @ApiProperty({ type: PickTotalsDto })
  totals: PickTotalsDto;

  @ApiProperty({
    type: [CharacterPickStatDto],
    description: 'Most added characters in the window',
  })
  characters: CharacterPickStatDto[];

  @ApiProperty({ type: [DailyPickStatDto], description: 'Oldest first' })
  daily: DailyPickStatDto[];
}
