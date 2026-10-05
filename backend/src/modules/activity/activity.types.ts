import { type ObjectId } from 'mongodb';
import { type SquadChangeReason } from '../squads/squads.types.js';

export interface ActivityCharacter {
  id: number;
  name: string;
  thumbnail: string;
}

export interface ActivityEventDocument {
  _id?: ObjectId;
  type: SquadChangeReason;
  userId: string;
  squadId: string;
  squadName: string;
  character?: ActivityCharacter;
  occurredAt: Date;
}

export interface HistoryCursor {
  occurredAt: string;
  id: string;
}

export interface HistoryPage {
  events: ActivityEventDocument[];
  hasMore: boolean;
}

export interface CharacterPickStat {
  characterId: number;
  name: string;
  thumbnail: string;
  added: number;
  removed: number;
  net: number;
  lastPickedAt: Date | null;
}

export interface DailyPickStat {
  date: string;
  added: number;
  removed: number;
}

export interface PickTotals {
  added: number;
  removed: number;
}

export interface PickStatsAggregate {
  characters: CharacterPickStat[];
  daily: DailyPickStat[];
  totals: PickTotals[];
}
