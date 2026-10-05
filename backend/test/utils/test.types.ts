export interface CharacterBody {
  id: number;
  name: string;
  quote: string | null;
  image: string;
  thumbnail: string;
  universe: string;
  tags: string[];
  abilities: { name: string; score: number }[];
}

export interface CharacterListBody {
  items: CharacterBody[];
  nextCursor: string | null;
  total: number;
}

export interface SquadMemberBody {
  position: number;
  character: CharacterBody;
}

export interface AbilityStatBody {
  name: string;
  average: number | null;
  min: number | null;
  max: number | null;
}

export interface SquadBody {
  id: string;
  name: string;
  members: SquadMemberBody[];
  stats: {
    memberCount: number;
    overallAverage: number | null;
    abilities: AbilityStatBody[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SquadSummaryBody {
  id: string;
  name: string;
  memberCount: number;
}

export interface SquadChangedBody {
  squadId: string;
  reason: string;
  characterId?: number;
}

export interface PopularityBody {
  characters: {
    characterId: number;
    name: string;
    thumbnail: string;
    picks: number;
  }[];
  updatedAt: string;
}

export interface ActivityEventBody {
  id: string;
  type: string;
  squadId: string;
  squadName: string;
  character: { id: number; name: string; thumbnail: string } | null;
  occurredAt: string;
}

export interface SquadHistoryBody {
  items: ActivityEventBody[];
  nextCursor: string | null;
}

export interface PickStatsBody {
  since: string;
  totals: { added: number; removed: number };
  characters: {
    characterId: number;
    name: string;
    added: number;
    removed: number;
    net: number;
    lastPickedAt: string | null;
  }[];
  daily: { date: string; added: number; removed: number }[];
}
