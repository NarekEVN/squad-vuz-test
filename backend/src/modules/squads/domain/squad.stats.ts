import { ABILITY_NAMES } from '../../../database/database.constants.js';
import { STAT_DECIMALS } from '../squads.constants.js';
import {
  type AbilityScores,
  type AbilityStat,
  type SquadStats,
} from '../squads.types.js';

function round(value: number): number {
  const factor = 10 ** STAT_DECIMALS;
  return Math.round(value * factor) / factor;
}

function average(values: number[]): number | null {
  return values.length > 0
    ? round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : null;
}

export function computeSquadStats(members: AbilityScores[]): SquadStats {
  const abilities: AbilityStat[] = ABILITY_NAMES.map((name) => {
    const scores = members.flatMap((member) =>
      member.abilities
        .filter((ability) => ability.name === name)
        .map((ability) => ability.score),
    );
    return {
      name,
      average: average(scores),
      min: scores.length > 0 ? Math.min(...scores) : null,
      max: scores.length > 0 ? Math.max(...scores) : null,
    };
  });

  return {
    memberCount: members.length,
    overallAverage: average(
      members.flatMap((member) =>
        member.abilities.map((ability) => ability.score),
      ),
    ),
    abilities,
  };
}
