import { ApiProperty } from '@nestjs/swagger';

export class SquadSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Saiyan Pride' })
  name: string;

  @ApiProperty({ example: 3 })
  memberCount: number;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
