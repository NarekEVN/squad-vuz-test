import { z } from 'zod';
import { ABILITY_NAMES } from '../database.constants.js';

export const sourceCharacterSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  quote: z.string().optional(),
  image: z.url(),
  thumbnail: z.url().optional(),
  universe: z.string().min(1),
  abilities: z.array(
    z.object({
      abilityName: z.enum(ABILITY_NAMES),
      abilityScore: z.number().int().min(1).max(10),
    }),
  ),
  tags: z
    .array(
      z.object({
        slot: z.number().int().positive(),
        tag_name: z.string().min(1),
      }),
    )
    .optional(),
});

export const sourceCharactersSchema = z.array(sourceCharacterSchema);
