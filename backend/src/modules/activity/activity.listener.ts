import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SQUAD_CHANGED_EVENT } from '../squads/squads.constants.js';
import { type SquadChangedEvent } from '../squads/squads.types.js';
import { ActivityService } from './activity.service.js';

@Injectable()
export class ActivityListener {
  private readonly logger = new Logger(ActivityListener.name);

  constructor(private readonly activityService: ActivityService) {}

  @OnEvent(SQUAD_CHANGED_EVENT, { async: true })
  async onSquadChanged(event: SquadChangedEvent): Promise<void> {
    try {
      await this.activityService.record(event);
    } catch (error) {
      this.logger.warn(
        `Activity event ${event.reason} for squad ${event.squadId} was not recorded: ${String(error)}`,
      );
    }
  }
}
