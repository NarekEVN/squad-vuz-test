import { ApiProperty } from '@nestjs/swagger';
import { ActivityEventDto } from './activity-event.dto.js';

export class SquadHistoryResponseDto {
  @ApiProperty({ type: [ActivityEventDto], description: 'Newest first' })
  items: ActivityEventDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;
}
