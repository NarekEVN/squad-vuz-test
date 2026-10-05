import { Injectable } from '@nestjs/common';
import { PopularityRepository } from './popularity.repository.js';
import { POPULARITY_LIMIT } from './realtime.constants.js';
import { type PopularityMessage } from './realtime.types.js';

@Injectable()
export class PopularityService {
  constructor(private readonly popularityRepository: PopularityRepository) {}

  async snapshot(): Promise<PopularityMessage> {
    return {
      characters: await this.popularityRepository.mostPicked(POPULARITY_LIMIT),
      updatedAt: new Date().toISOString(),
    };
  }
}
