export const SQUAD_NAME_MAX_LENGTH = 50;
export const MAX_SQUADS_PER_USER = 20;
export const CHARACTER_IDS_MAX_COUNT = 50;
export const STAT_DECIMALS = 2;

export const SQUAD_CHANGED_EVENT = 'squad.changed';

export const SquadChange = {
  Created: 'created',
  Updated: 'updated',
  Deleted: 'deleted',
  MemberAdded: 'member-added',
  MemberRemoved: 'member-removed',
} as const;
