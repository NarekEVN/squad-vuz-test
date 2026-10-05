export const REALTIME_NAMESPACE = '/realtime';

export const ServerEvent = {
  SquadChanged: 'squad:changed',
  PopularityUpdated: 'popularity:updated',
} as const;

export const USER_ROOM_PREFIX = 'user:';
export const POPULARITY_LIMIT = 10;
export const POPULARITY_DEBOUNCE_MS = 500;
