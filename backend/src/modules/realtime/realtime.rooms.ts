import { USER_ROOM_PREFIX } from './realtime.constants.js';

export function userRoom(userId: string): string {
  return `${USER_ROOM_PREFIX}${userId}`;
}
