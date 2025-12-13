/**
 * Configurações centralizadas do sistema de jogo.
 * 
 * Este arquivo contém todas as constantes e configurações relacionadas aos
 * modos de jogo, timers, pontuação e regras.
 * 
 * @module config/game-config
 */

/**
 * Configurações do timer do jogo.
 * Nota: O timer agora é customizável pelo usuário (20s, 30s, 45s).
 * Estes valores são usados como referência para cálculo de bônus.
 */
export const TIMER_CONFIG = {
  /** Duração padrão do timer em segundos (padrão: 30s) */
  DURATION: 30,
  /** Opções de duração disponíveis */
  DURATION_OPTIONS: [20, 30, 45] as const,
  /** Intervalo de atualização em milissegundos */
  UPDATE_INTERVAL: 1000,
  /** Percentual do tempo considerado "rápido" para bônus (>66% restante) */
  FAST_ANSWER_PERCENTAGE: 0.66,
  /** Percentual do tempo considerado "médio" para bônus (>33% restante) */
  MEDIUM_ANSWER_PERCENTAGE: 0.33
} as const;

/**
 * Configurações de pontuação.
 */
export const SCORING_CONFIG = {
  /** Pontos base por acerto */
  BASE_POINTS: 5,
  /** Bônus por resposta rápida (> 40s restantes) */
  FAST_BONUS: 2,
  /** Bônus por resposta média (> 20s restantes) */
  MEDIUM_BONUS: 1,
  /** Pontos por streak de 5 acertos */
  STREAK_5_BONUS: 10,
  /** Pontos por streak de 10 acertos */
  STREAK_10_BONUS: 25
} as const;

/**
 * Configurações de tentativas e limites.
 */
export const ATTEMPT_CONFIG = {
  /** Número máximo de tentativas no modo prática (0 = ilimitado) */
  MAX_PRACTICE_ATTEMPTS: 0,
  /** Número máximo de tentativas no modo competitivo */
  MAX_COMPETITIVE_ATTEMPTS: 1,
  /** Cooldown entre tentativas em segundos */
  ATTEMPT_COOLDOWN: 2
} as const;

/**
 * Configurações de seleção de jogadores.
 */
export const PLAYER_SELECTION_CONFIG = {
  /** Máximo de jogadores a usar antes de resetar o pool */
  MAX_USED_PLAYERS: 50,
  /** Se deve embaralhar jogadores ao resetar */
  SHUFFLE_ON_RESET: true,
  /** Se deve priorizar jogadores não usados recentemente */
  PRIORITIZE_UNUSED: true
} as const;

/**
 * Configurações de validação de nome.
 */
export const NAME_VALIDATION_CONFIG = {
  /** Threshold de confiança mínimo para match (0-1) */
  MIN_CONFIDENCE: 0.5,
  /** Se deve considerar apelidos */
  USE_NICKNAMES: true,
  /** Se deve normalizar acentos */
  NORMALIZE_ACCENTS: true,
  /** Se deve ignorar case */
  IGNORE_CASE: true,
  /** Percentual mínimo de palavras que devem matchear */
  MIN_WORD_MATCH_PERCENTAGE: 0.5
} as const;

/**
 * Configurações de cache e performance.
 */
export const CACHE_CONFIG = {
  /** Duração do cache de jogadores em milissegundos */
  PLAYERS_CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  /** Duração do cache de imagens em milissegundos */
  IMAGES_CACHE_DURATION: 30 * 60 * 1000, // 30 minutos
  /** Se deve pré-carregar próximo jogador */
  PRELOAD_NEXT_PLAYER: true
} as const;

/**
 * Configurações de UI e feedback.
 */
export const UI_CONFIG = {
  /** Duração de animações em milissegundos */
  ANIMATION_DURATION: 300,
  /** Delay antes de trocar de jogador após acerto */
  NEXT_PLAYER_DELAY: 1500,
  /** Duração da exibição de toast em milissegundos */
  TOAST_DURATION: 3000,
  /** Se deve mostrar tutorial para novos usuários */
  SHOW_TUTORIAL: true
} as const;

/**
 * Configurações de analytics e tracking.
 */
export const ANALYTICS_CONFIG = {
  /** Se deve rastrear eventos de jogo */
  TRACK_GAME_EVENTS: true,
  /** Se deve rastrear performance */
  TRACK_PERFORMANCE: true,
  /** Intervalo de envio de métricas em milissegundos */
  METRICS_FLUSH_INTERVAL: 10000, // 10 segundos
  /** Eventos a serem rastreados */
  TRACKED_EVENTS: [
    'game_start',
    'game_end',
    'correct_guess',
    'incorrect_guess',
    'difficulty_change',
    'achievement_unlocked'
  ] as const
} as const;

/**
 * Modos de jogo disponíveis.
 */
export const GAME_MODES = {
  ADAPTIVE: {
    id: 'adaptive',
    name: 'Quiz Adaptativo',
    description: 'Dificuldade ajusta automaticamente baseado no seu desempenho',
    path: '/quiz-adaptativo',
    icon: '🎯'
  },
  DECADE: {
    id: 'decade',
    name: 'Quiz por Década',
    description: 'Teste seus conhecimentos sobre jogadores de cada época',
    path: '/quiz-decada',
    icon: '📅'
  }
} as const;

/**
 * Tipo dos modos de jogo.
 */
export type GameModeId = keyof typeof GAME_MODES;

/**
 * Décadas disponíveis para o modo década.
 */
export const AVAILABLE_DECADES = [
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s'
] as const;

/**
 * Tipo das décadas disponíveis.
 */
export type AvailableDecade = typeof AVAILABLE_DECADES[number];

/**
 * Calcula pontos com base na dificuldade e tempo restante.
 * Agora usa percentuais em vez de valores absolutos para suportar timer customizável.
 * 
 * @param difficultyMultiplier - Multiplicador da dificuldade
 * @param timeLeft - Tempo restante em segundos
 * @param timerDuration - Duração total do timer (padrão: 30s)
 * @returns Pontos calculados
 * 
 * @example
 * ```typescript
 * const points = calculatePoints(1.5, 25, 30);
 * // Com 25/30 (83%) restante -> bônus rápido
 * // Retorna: 5 * 1.5 + 2 = 9.5 (arredondado para 9)
 * ```
 */
export const calculatePoints = (
  difficultyMultiplier: number,
  timeLeft: number,
  timerDuration: number = TIMER_CONFIG.DURATION
): number => {
  const basePoints = SCORING_CONFIG.BASE_POINTS;
  const timePercentage = timeLeft / timerDuration;
  
  let timeBonus = 0;
  if (timePercentage > TIMER_CONFIG.FAST_ANSWER_PERCENTAGE) {
    timeBonus = SCORING_CONFIG.FAST_BONUS;
  } else if (timePercentage > TIMER_CONFIG.MEDIUM_ANSWER_PERCENTAGE) {
    timeBonus = SCORING_CONFIG.MEDIUM_BONUS;
  }
  
  return Math.floor(basePoints * difficultyMultiplier + timeBonus);
};

/**
 * Verifica se deve dar bônus de streak.
 * 
 * @param currentStreak - Streak atual
 * @returns Pontos de bônus ou 0
 * 
 * @example
 * ```typescript
 * const bonus = getStreakBonus(10); // 25
 * ```
 */
export const getStreakBonus = (currentStreak: number): number => {
  if (currentStreak === 10) {
    return SCORING_CONFIG.STREAK_10_BONUS;
  }
  if (currentStreak === 5) {
    return SCORING_CONFIG.STREAK_5_BONUS;
  }
  return 0;
};
