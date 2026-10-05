import { type MemberDiff } from '../squads.types.js';

export function diffMembers(
  before: readonly number[],
  after: readonly number[],
): MemberDiff {
  const previous = new Set(before);
  const next = new Set(after);
  return {
    added: after.filter((id) => !previous.has(id)),
    removed: before.filter((id) => !next.has(id)),
  };
}
