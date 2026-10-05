import { ApiProperty } from '@nestjs/swagger';
import { SquadChange } from '../../squads/squads.constants.js';
import { type SquadChangeReason } from '../../squads/squads.types.js';
import { ActivityCharacterDto } from './activity-character.dto.js';

export class ActivityEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: Object.values(SquadChange), example: 'member-added' })
  type: SquadChangeReason;

  @ApiProperty({ format: 'uuid' })
  squadId: string;

  @ApiProperty({
    example: 'Saiyan Pride',
    description: 'Squad name when the event happened',
  })
  squadName: string;

  @ApiProperty({
    type: ActivityCharacterDto,
    nullable: true,
    description: 'Character snapshot for member events',
  })
  character: ActivityCharacterDto | null;

  @ApiProperty({ format: 'date-time' })
  occurredAt: string;
}
