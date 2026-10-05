import { diffMembers } from './squad.diff.js';

describe('diffMembers', () => {
  it('lists characters added and removed by a replacement', () => {
    expect(diffMembers([1, 2, 3], [3, 4, 1])).toEqual({
      added: [4],
      removed: [2],
    });
  });

  it('treats a reorder as no change', () => {
    expect(diffMembers([1, 2, 3], [3, 2, 1])).toEqual({
      added: [],
      removed: [],
    });
  });

  it('handles empty lineups on either side', () => {
    expect(diffMembers([], [5, 6])).toEqual({ added: [5, 6], removed: [] });
    expect(diffMembers([5, 6], [])).toEqual({ added: [], removed: [5, 6] });
  });
});
