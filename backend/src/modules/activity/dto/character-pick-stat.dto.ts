import { ApiProperty } from '@nestjs/swagger';

export class CharacterPickStatDto {
  @ApiProperty({ example: 37 })
  characterId: number;

  @ApiProperty({ example: 'Adult Gohan' })
  name: string;

  @ApiProperty({ format: 'uri' })
  thumbnail: string;

  @ApiProperty({ example: 12, description: 'Times added to a squad' })
  added: number;

  @ApiProperty({ example: 3, description: 'Times removed from a squad' })
  removed: number;

  @ApiProperty({ example: 9, description: 'added - removed' })
  net: number;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastPickedAt: string | null;
}
