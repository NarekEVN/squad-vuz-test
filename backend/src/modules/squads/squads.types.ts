import {
  type AbilityName,
  type SquadRow,
} from '../../database/database.types.js';

export interface SquadMemberSlot {
  characterId: number;
  position: number;
}

export interface SquadState {
  squad: SquadRow;
  members: SquadMemberSlot[];
}

export interface SquadSummaryRow {
  id: string;
  name: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbilityScores {
  abilities: { name: AbilityName; score: number }[];
}

export interface AbilityStat {
  name: AbilityName;
  average: number | null;
  min: number | null;
  max: number | null;
}

export interface SquadStats {
  memberCount: number;
  overallAverage: number | null;
  abilities: AbilityStat[];
}
