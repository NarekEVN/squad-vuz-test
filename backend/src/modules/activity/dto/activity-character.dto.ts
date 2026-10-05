import { ApiProperty } from '@nestjs/swagger';

export class ActivityCharacterDto {
  @ApiProperty({ example: 208 })
  id: number;

  @ApiProperty({ example: 'Baraka' })
  name: string;

  @ApiProperty({ format: 'uri' })
  thumbnail: string;
}
