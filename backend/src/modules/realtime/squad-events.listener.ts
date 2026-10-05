import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SQUAD_CHANGED_EVENT } from '../squads/squads.constants.js';
import { type SquadChangedEvent } from '../squads/squads.types.js';
import { PopularityService } from './popularity.service.js';
import { POPULARITY_DEBOUNCE_MS } from './realtime.constants.js';
import { RealtimeGateway } from './realtime.gateway.js';

@Injectable()
export class SquadEventsListener implements OnModuleDestroy {
  private readonly logger = new Logger(SquadEventsListener.name);
  private popularityTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly popularityService: PopularityService,
  ) {}

  @OnEvent(SQUAD_CHANGED_EVENT)
  onSquadChanged({ userId, ...message }: SquadChangedEvent): void {
    this.gateway.emitSquadChanged(userId, message);
    this.schedulePopularityBroadcast();
  }

  onModuleDestroy(): void {
    clearTimeout(this.popularityTimer);
  }

  private schedulePopularityBroadcast(): void {
    if (this.popularityTimer) {
      return;
    }
    this.popularityTimer = setTimeout(() => {
      this.popularityTimer = undefined;
      this.popularityService
        .snapshot()
        .then((snapshot) => this.gateway.broadcastPopularity(snapshot))
        .catch((error: unknown) => {
          this.logger.warn(`Popularity broadcast failed: ${String(error)}`);
        });
    }, POPULARITY_DEBOUNCE_MS);
  }
}
