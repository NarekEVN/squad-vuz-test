import { ApiProperty } from '@nestjs/swagger';

export class PickTotalsDto {
  @ApiProperty({ example: 120 })
  added: number;

  @ApiProperty({ example: 31 })
  removed: number;
}
