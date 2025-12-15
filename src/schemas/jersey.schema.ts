import { z } from 'zod';
import { DifficultyLevelSchema } from './player.schema';

/**
 * Schema para tipo de camisa
 */
export const JerseyTypeSchema = z.enum(['home', 'away', 'third', 'special']);

/**
 * Schema principal da camisa
 */
export const JerseySchema = z.object({
  id: z.string().uuid(),
  year: z.number().int().min(1902).max(2030),
  image_url: z.string().url(),
  type: JerseyTypeSchema.default('home'),
  manufacturer: z.string().nullable().optional(),
  season: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  fun_fact: z.string().nullable().optional(),
  nicknames: z.array(z.string()).nullable().optional(),
  difficulty_level: DifficultyLevelSchema.nullable().optional(),
  difficulty_score: z.number().min(0).max(100).nullable().optional(),
  difficulty_confidence: z.number().min(0).max(1).nullable().optional(),
  total_attempts: z.number().int().min(0).nullable().optional(),
  correct_attempts: z.number().int().min(0).nullable().optional(),
  average_guess_time: z.number().int().min(0).nullable().optional(),
  decades: z.array(z.string()).nullable().optional(),
  created_at: z.string().datetime().optional(),
});

/**
 * Schema para lista de camisas
 */
export const JerseyListSchema = z.array(JerseySchema);

/**
 * Schema para criação de camisa
 */
export const CreateJerseySchema = JerseySchema.omit({ 
  id: true, 
  created_at: true,
  total_attempts: true,
  correct_attempts: true,
  average_guess_time: true,
  difficulty_score: true,
  difficulty_confidence: true,
});

/**
 * Schema para atualização de camisa
 */
export const UpdateJerseySchema = JerseySchema.partial().required({ id: true });

/**
 * Schema para palpite de ano
 */
export const JerseyGuessSchema = z.object({
  year: z.number().int().min(1902).max(2030),
});

/**
 * Schema para resultado de palpite
 */
export const JerseyGuessResultSchema = z.object({
  isCorrect: z.boolean(),
  yearDifference: z.number().int().min(0),
  hint: z.enum(['higher', 'lower']).optional(),
  pointsEarned: z.number().int().min(0),
  bonusPoints: z.number().int().min(0).optional(),
  correctYear: z.number().int(),
  userGuess: z.number().int(),
});

/**
 * Schema para sessão do jogo
 */
export const JerseyGameSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  game_mode: z.enum(['adaptive', 'decade', 'classic']).default('adaptive'),
  final_score: z.number().int().min(0),
  correct_guesses: z.number().int().min(0),
  total_attempts: z.number().int().min(0),
  max_streak: z.number().int().min(0),
  difficulty_level: z.string().nullable().optional(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Schema para entrada no ranking
 */
export const JerseyRankingEntrySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().nullable().optional(),
  player_name: z.string().trim().min(1).max(100),
  score: z.number().int().min(0),
  correct_guesses: z.number().int().min(0),
  total_attempts: z.number().int().min(0),
  max_streak: z.number().int().min(0),
  difficulty_level: z.string().nullable().optional(),
  game_mode: z.enum(['adaptive', 'decade', 'classic']).default('adaptive'),
  game_duration: z.number().int().min(0).nullable().optional(),
  created_at: z.string().datetime().optional(),
});

/**
 * Schema para estatísticas de dificuldade
 */
export const JerseyDifficultyStatSchema = z.object({
  id: z.string().uuid().optional(),
  jersey_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  session_id: z.string().nullable().optional(),
  guess_time: z.number().int().min(0),
  year_difference: z.number().int().min(0),
  is_correct: z.boolean(),
  device_type: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

/**
 * Types inferidos dos schemas
 */
export type ValidatedJersey = z.infer<typeof JerseySchema>;
export type ValidatedJerseyGuess = z.infer<typeof JerseyGuessSchema>;
export type ValidatedJerseyGuessResult = z.infer<typeof JerseyGuessResultSchema>;
export type ValidatedJerseyGameSession = z.infer<typeof JerseyGameSessionSchema>;
export type ValidatedJerseyRankingEntry = z.infer<typeof JerseyRankingEntrySchema>;
export type ValidatedJerseyDifficultyStat = z.infer<typeof JerseyDifficultyStatSchema>;
export type CreateJerseyInput = z.infer<typeof CreateJerseySchema>;
export type UpdateJerseyInput = z.infer<typeof UpdateJerseySchema>;
