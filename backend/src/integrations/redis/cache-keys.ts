export const CacheScope = {
  Characters: 'characters',
} as const;

export type CacheScope = (typeof CacheScope)[keyof typeof CacheScope];

export function cacheVersionKey(scope: CacheScope): string {
  return `cache:${scope}:version`;
}
