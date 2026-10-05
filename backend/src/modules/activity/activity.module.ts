import { Module } from '@nestjs/common';
import { CharactersModule } from '../characters/characters.module.js';
import { ActivityController } from './activity.controller.js';
import { ActivityListener } from './activity.listener.js';
import { ActivityRepository } from './activity.repository.js';
import { ActivityService } from './activity.service.js';

@Module({
  imports: [CharactersModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService, ActivityListener],
})
export class ActivityModule {}
