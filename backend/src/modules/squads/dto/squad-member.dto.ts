import { ApiProperty } from '@nestjs/swagger';
import { SQUAD_MAX_MEMBERS } from '../../../database/database.constants.js';
import { CharacterDto } from '../../characters/dto/character.dto.js';

export class SquadMemberDto {
  @ApiProperty({ minimum: 1, maximum: SQUAD_MAX_MEMBERS, example: 1 })
  position: number;

  @ApiProperty({ type: CharacterDto })
  character: CharacterDto;
}
