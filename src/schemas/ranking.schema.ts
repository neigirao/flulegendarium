import { z } from 'zod';
import { GameModeSchema } from './game.schema';
import { DifficultyLevelSchema } from './player.schema';

/**
 * Schema para entrada no ranking
 */
export const RankingEntrySchema = z.object({
  id: z.string().uuid().optional(),
  playerName: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  score: z.number().int(), // Permite negativo após pular jogador
  gameMode: GameModeSchema.default('classic'),
  difficultyLevel: DifficultyLevelSchema.optional(),
  gamesPlayed: z.number().int().min(1).default(1),
  userId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

/**
 * Schema para criação de entrada no ranking
 */
export const CreateRankingEntrySchema = RankingEntrySchema.omit({
  id: true,
  createdAt: true,
});

/**
 * Schema para lista de ranking
 */
export const RankingListSchema = z.array(RankingEntrySchema);

/**
 * Schema para filtros de ranking
 */
export const RankingFiltersSchema = z.object({
  gameMode: GameModeSchema.optional(),
  difficultyLevel: DifficultyLevelSchema.optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

/**
 * Types inferidos
 */
export type ValidatedRankingEntry = z.infer<typeof RankingEntrySchema>;
export type CreateRankingEntryInput = z.infer<typeof CreateRankingEntrySchema>;
export type ValidatedRankingFilters = z.infer<typeof RankingFiltersSchema>;
