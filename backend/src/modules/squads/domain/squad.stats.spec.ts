import { type AbilityName } from '../../../database/database.types.js';
import { computeSquadStats } from './squad.stats.js';

function member(scores: Record<AbilityName, number>) {
  return {
    abilities: Object.entries(scores).map(([name, score]) => ({
      name: name as AbilityName,
      score,
    })),
  };
}

describe('computeSquadStats', () => {
  it('averages, minimums and maximums each ability', () => {
    const stats = computeSquadStats([
      member({
        Mobility: 2,
        Technique: 3,
        Survivability: 5,
        Power: 10,
        Energy: 6,
      }),
      member({
        Mobility: 7,
        Technique: 4,
        Survivability: 1,
        Power: 8,
        Energy: 6,
      }),
      member({
        Mobility: 9,
        Technique: 4,
        Survivability: 3,
        Power: 1,
        Energy: 6,
      }),
    ]);

    expect(stats.memberCount).toBe(3);
    expect(stats.abilities).toEqual([
      { name: 'Mobility', average: 6, min: 2, max: 9 },
      { name: 'Technique', average: 3.67, min: 3, max: 4 },
      { name: 'Survivability', average: 3, min: 1, max: 5 },
      { name: 'Power', average: 6.33, min: 1, max: 10 },
      { name: 'Energy', average: 6, min: 6, max: 6 },
    ]);
    expect(stats.overallAverage).toBe(5);
  });

  it('keeps the ability order fixed regardless of input order', () => {
    const shuffled = {
      abilities: [
        { name: 'Energy' as const, score: 1 },
        { name: 'Mobility' as const, score: 2 },
        { name: 'Power' as const, score: 3 },
        { name: 'Technique' as const, score: 4 },
        { name: 'Survivability' as const, score: 5 },
      ],
    };

    expect(computeSquadStats([shuffled]).abilities.map((a) => a.name)).toEqual([
      'Mobility',
      'Technique',
      'Survivability',
      'Power',
      'Energy',
    ]);
  });

  it('returns nulls for an empty squad', () => {
    const stats = computeSquadStats([]);

    expect(stats.memberCount).toBe(0);
    expect(stats.overallAverage).toBeNull();
    expect(stats.abilities.every((a) => a.average === null)).toBe(true);
    expect(stats.abilities.every((a) => a.min === null && a.max === null)).toBe(
      true,
    );
  });
});
