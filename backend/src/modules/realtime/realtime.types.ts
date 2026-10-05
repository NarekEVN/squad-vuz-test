import { type AuthUser } from '../../common/types/request.types.js';
import { type SquadChangeReason } from '../squads/squads.types.js';

export interface SocketData {
  user?: AuthUser;
}

export interface SquadChangedMessage {
  squadId: string;
  reason: SquadChangeReason;
  characterId?: number;
}

export interface PopularCharacter {
  characterId: number;
  name: string;
  thumbnail: string;
  picks: number;
}

export interface PopularityMessage {
  characters: PopularCharacter[];
  updatedAt: string;
}
