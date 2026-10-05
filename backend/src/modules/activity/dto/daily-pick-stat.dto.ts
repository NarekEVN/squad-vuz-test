import { ApiProperty } from '@nestjs/swagger';

export class DailyPickStatDto {
  @ApiProperty({ example: '2026-10-05', description: 'UTC day' })
  date: string;

  @ApiProperty({ example: 40 })
  added: number;

  @ApiProperty({ example: 11 })
  removed: number;
}
