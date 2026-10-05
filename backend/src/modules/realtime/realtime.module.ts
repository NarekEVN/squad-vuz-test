import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PopularityRepository } from './popularity.repository.js';
import { PopularityService } from './popularity.service.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { SquadEventsListener } from './squad-events.listener.js';

@Module({
  imports: [AuthModule],
  providers: [
    PopularityRepository,
    PopularityService,
    RealtimeGateway,
    SquadEventsListener,
  ],
})
export class RealtimeModule {}
