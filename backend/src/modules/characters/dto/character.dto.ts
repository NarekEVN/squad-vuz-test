import { ApiProperty } from '@nestjs/swagger';
import { CharacterAbilityDto } from './character-ability.dto.js';

export class CharacterDto {
  @ApiProperty({ example: 208 })
  id: number;

  @ApiProperty({ example: 'Baraka' })
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: "Speak. You've earned the chance.",
  })
  quote: string | null;

  @ApiProperty({ format: 'uri' })
  image: string;

  @ApiProperty({
    format: 'uri',
    description: 'Falls back to image when the source has no thumbnail',
  })
  thumbnail: string;

  @ApiProperty({ example: 'Mortal Kombat' })
  universe: string;

  @ApiProperty({ type: [String], example: ['monster', 'melee'] })
  tags: string[];

  @ApiProperty({ type: [CharacterAbilityDto] })
  abilities: CharacterAbilityDto[];
}
