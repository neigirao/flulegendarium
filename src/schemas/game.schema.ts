import { z } from 'zod';
import { DifficultyLevelSchema } from './player.schema';

/**
 * Schema para modo de jogo
 */
export const GameModeSchema = z.enum(['classic', 'adaptive', 'decade']);

/**
 * Schema para resultado de tentativa
 */
export const GuessResultSchema = z.object({
  isCorrect: z.boolean(),
  confidence: z.number().min(0).max(1),
  pointsEarned: z.number().int().min(0),
  timeSpent: z.number().int().min(0),
  correctName: z.string(),
  userGuess: z.string(),
});

/**
 * Schema para metadata de jogo adaptivo
 */
export const AdaptiveGameMetadataSchema = z.object({
  currentDifficulty: DifficultyLevelSchema,
  correctSequence: z.number().int().min(0).default(0),
  incorrectSequence: z.number().int().min(0).default(0),
  difficultyProgress: z.number().min(0).max(100).default(0),
});

/**
 * Schema para metadata de jogo por década
 */
export const DecadeGameMetadataSchema = z.object({
  selectedDecade: z.string().nullable(),
  availablePlayers: z.array(z.string().uuid()),
  totalDecadePlayers: z.number().int().min(0),
});

/**
 * Schema base para estado do jogo
 */
export const GameStateSchema = z.object({
  mode: GameModeSchema,
  currentPlayer: z.string().uuid().nullable(),
  score: z.number().int().default(0), // Permite negativo após pular jogador
  gameOver: z.boolean().default(false),
  gameActive: z.boolean().default(false),
  timeLeft: z.number().int().min(0).nullable(),
  currentStreak: z.number().int().min(0).default(0),
  maxStreak: z.number().int().min(0).default(0),
  totalAttempts: z.number().int().min(0).default(0),
  correctGuesses: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Schema para sessão de jogo
 */
export const GameSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  gameMode: GameModeSchema,
  finalScore: z.number().int().min(0),
  totalCorrect: z.number().int().min(0),
  totalAttempts: z.number().int().min(0),
  maxStreak: z.number().int().min(0),
  duration: z.number().int().min(0),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  difficultyLevel: DifficultyLevelSchema.optional(),
  difficultyMultiplier: z.number().min(1).optional(),
});

/**
 * Schema para tentativa de jogo
 */
export const GameAttemptSchema = z.object({
  id: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  targetPlayerName: z.string().min(1),
  guess: z.string().min(1),
  isCorrect: z.boolean(),
  confidence: z.number().min(0).max(1).optional(),
  timeSpent: z.number().int().min(0).optional(),
  pointsEarned: z.number().int().min(0).optional(),
  attemptNumber: z.number().int().min(1),
  createdAt: z.string().datetime().optional(),
});

/**
 * Schema para estatísticas do jogador
 */
export const PlayerStatsSchema = z.object({
  totalGames: z.number().int().min(0).default(0),
  totalPoints: z.number().int().min(0).default(0),
  highScore: z.number().int().min(0).default(0),
  accuracyRate: z.number().min(0).max(100).default(0),
  avgResponseTime: z.number().min(0).default(0),
  maxStreak: z.number().int().min(0).default(0),
  achievementsUnlocked: z.number().int().min(0).default(0),
  rankPosition: z.number().int().min(0).nullable().optional(),
});

/**
 * Types inferidos
 */
export type ValidatedGameMode = z.infer<typeof GameModeSchema>;
export type ValidatedGuessResult = z.infer<typeof GuessResultSchema>;
export type ValidatedGameState = z.infer<typeof GameStateSchema>;
export type ValidatedGameSession = z.infer<typeof GameSessionSchema>;
export type ValidatedGameAttempt = z.infer<typeof GameAttemptSchema>;
export type ValidatedPlayerStats = z.infer<typeof PlayerStatsSchema>;
export type ValidatedAdaptiveMetadata = z.infer<typeof AdaptiveGameMetadataSchema>;
export type ValidatedDecadeMetadata = z.infer<typeof DecadeGameMetadataSchema>;
