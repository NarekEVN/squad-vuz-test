import { ApiProperty } from '@nestjs/swagger';

export class FilterOptionDto {
  @ApiProperty({ example: 'alien' })
  name: string;

  @ApiProperty({ example: 40 })
  count: number;
}
