import { ApiProperty } from '@nestjs/swagger';
import { CharacterDto } from './character.dto.js';

export class CharacterListResponseDto {
  @ApiProperty({ type: [CharacterDto] })
  items: CharacterDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Pass as cursor to get the next page; null on the last page',
  })
  nextCursor: string | null;

  @ApiProperty({ description: 'Characters matching the filters', example: 44 })
  total: number;
}
