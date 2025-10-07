/**
 * Barrel export para todos os schemas de validação
 */

// Player schemas
export {
  PlayerSchema,
  PlayerListSchema,
  CreatePlayerSchema,
  UpdatePlayerSchema,
  PlayerStatisticsSchema,
  DifficultyLevelSchema,
  type ValidatedPlayer,
  type ValidatedPlayerStatistics,
  type ValidatedDifficultyLevel,
  type CreatePlayerInput,
  type UpdatePlayerInput,
} from './player.schema';

// Game schemas
export {
  GameModeSchema,
  GuessResultSchema,
  GameStateSchema,
  GameSessionSchema,
  GameAttemptSchema,
  PlayerStatsSchema,
  AdaptiveGameMetadataSchema,
  DecadeGameMetadataSchema,
  type ValidatedGameMode,
  type ValidatedGuessResult,
  type ValidatedGameState,
  type ValidatedGameSession,
  type ValidatedGameAttempt,
  type ValidatedPlayerStats,
  type ValidatedAdaptiveMetadata,
  type ValidatedDecadeMetadata,
} from './game.schema';

// Ranking schemas
export {
  RankingEntrySchema,
  CreateRankingEntrySchema,
  RankingListSchema,
  RankingFiltersSchema,
  type ValidatedRankingEntry,
  type CreateRankingEntryInput,
  type ValidatedRankingFilters,
} from './ranking.schema';
