import { z } from 'zod';

/**
 * Schema de validação para estatísticas de jogador
 */
export const PlayerStatisticsSchema = z.object({
  gols: z.number().int().min(0).default(0),
  jogos: z.number().int().min(0).default(0),
});

/**
 * Schema de validação para nível de dificuldade
 */
export const DifficultyLevelSchema = z.enum([
  'muito_facil',
  'facil',
  'medio',
  'dificil',
  'muito_dificil',
]);

/**
 * Schema de validação completo para Player
 */
export const PlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  position: z.string().min(1, 'Posição é obrigatória').max(100),
  image_url: z.string().url('URL de imagem inválida'),
  year_highlight: z.string().max(500).default(''),
  fun_fact: z.string().max(1000).default(''),
  achievements: z.array(z.string().max(200)).default([]),
  nicknames: z.array(z.string().max(100)).optional(),
  statistics: PlayerStatisticsSchema,
  // Campos de dificuldade
  difficulty_level: DifficultyLevelSchema.optional(),
  difficulty_score: z.number().int().min(0).max(100).optional(),
  difficulty_confidence: z.number().min(0).max(1).optional(),
  total_attempts: z.number().int().min(0).optional(),
  correct_attempts: z.number().int().min(0).optional(),
  average_guess_time: z.number().int().min(0).optional(),
  // Campo de década
  decade: z.string().optional(),
  decades: z.array(z.string()).optional(),
});

/**
 * Schema para lista de jogadores
 */
export const PlayerListSchema = z.array(PlayerSchema);

/**
 * Schema para criação de jogador (sem id e timestamps)
 */
export const CreatePlayerSchema = PlayerSchema.omit({ 
  id: true,
  total_attempts: true,
  correct_attempts: true,
  average_guess_time: true,
});

/**
 * Schema para atualização de jogador (campos opcionais)
 */
export const UpdatePlayerSchema = PlayerSchema.partial().required({ id: true });

/**
 * Types inferidos dos schemas
 */
export type ValidatedPlayer = z.infer<typeof PlayerSchema>;
export type ValidatedPlayerStatistics = z.infer<typeof PlayerStatisticsSchema>;
export type ValidatedDifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type CreatePlayerInput = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof UpdatePlayerSchema>;
