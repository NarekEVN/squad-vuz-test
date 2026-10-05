import { Module } from '@nestjs/common';
import { CharactersModule } from '../characters/characters.module.js';
import { SquadsController } from './squads.controller.js';
import { SquadsRepository } from './squads.repository.js';
import { SquadsService } from './squads.service.js';

@Module({
  imports: [CharactersModule],
  controllers: [SquadsController],
  providers: [SquadsRepository, SquadsService],
})
export class SquadsModule {}
