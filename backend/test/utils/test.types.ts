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
