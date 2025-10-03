/**
 * Configuração centralizada dos níveis de dificuldade do jogo.
 * 
 * Usado em ambos os modos de jogo (Adaptativo e Década) para:
 * - Definir multiplicadores de pontuação
 * - Configurar critérios de progressão
 * - Estilização visual dos indicadores
 * 
 * @module config/difficulty-levels
 */

import { DifficultyLevel } from '@/types/guess-game';

/**
 * Interface que define as propriedades de um nível de dificuldade.
 */
export interface DifficultyLevelConfig {
  /** Identificador do nível */
  level: DifficultyLevel;
  /** Label exibido ao usuário */
  label: string;
  /** Cor associada ao nível (classe Tailwind) */
  color: string;
  /** Ícone representativo */
  icon: string;
  /** Multiplicador de pontos */
  multiplier: number;
  /** Descrição do nível */
  description: string;
}

/**
 * Configuração dos 5 níveis de dificuldade.
 * 
 * @constant
 * 
 * **Progressão:**
 * - Subir nível: 3 acertos consecutivos
 * - Descer nível: 2 erros consecutivos
 * 
 * **Multiplicadores:**
 * - Muito Fácil: 0.5x pontos
 * - Fácil: 0.75x pontos
 * - Médio: 1.0x pontos (base)
 * - Difícil: 1.5x pontos
 * - Muito Difícil: 2.0x pontos
 */
export const DIFFICULTY_LEVELS: readonly DifficultyLevelConfig[] = [
  {
    level: 'muito_facil',
    label: 'Muito Fácil',
    color: 'bg-green-500',
    icon: '😊',
    multiplier: 0.5,
    description: 'Jogadores muito conhecidos e populares'
  },
  {
    level: 'facil',
    label: 'Fácil',
    color: 'bg-blue-500',
    icon: '🙂',
    multiplier: 0.75,
    description: 'Jogadores conhecidos da torcida'
  },
  {
    level: 'medio',
    label: 'Médio',
    color: 'bg-yellow-500',
    icon: '😐',
    multiplier: 1.0,
    description: 'Jogadores com relevância moderada'
  },
  {
    level: 'dificil',
    label: 'Difícil',
    color: 'bg-orange-500',
    icon: '😅',
    multiplier: 1.5,
    description: 'Jogadores menos conhecidos'
  },
  {
    level: 'muito_dificil',
    label: 'Muito Difícil',
    color: 'bg-red-500',
    icon: '😰',
    multiplier: 2.0,
    description: 'Jogadores raros e esquecidos'
  }
] as const;

/**
 * Tipo derivado dos níveis configurados.
 * Garante type-safety ao referenciar níveis.
 */
export type ConfiguredDifficultyLevel = typeof DIFFICULTY_LEVELS[number]['level'];

/**
 * Obtém a configuração de um nível específico.
 * 
 * @param level - Nível de dificuldade
 * @returns Configuração completa do nível
 * @throws Error se o nível não existir
 * 
 * @example
 * ```typescript
 * const config = getDifficultyConfig('medio');
 * console.log(config.multiplier); // 1.0
 * ```
 */
export const getDifficultyConfig = (
  level: DifficultyLevel
): DifficultyLevelConfig => {
  const config = DIFFICULTY_LEVELS.find(d => d.level === level);
  
  if (!config) {
    throw new Error(`Nível de dificuldade inválido: ${level}`);
  }
  
  return config;
};

/**
 * Obtém o índice numérico de um nível de dificuldade.
 * Útil para comparações e progressão.
 * 
 * @param level - Nível de dificuldade
 * @returns Índice de 0 a 4
 * 
 * @example
 * ```typescript
 * const index = getDifficultyIndex('dificil'); // 3
 * ```
 */
export const getDifficultyIndex = (level: DifficultyLevel): number => {
  return DIFFICULTY_LEVELS.findIndex(d => d.level === level);
};

/**
 * Obtém o próximo nível de dificuldade.
 * 
 * @param currentLevel - Nível atual
 * @returns Próximo nível ou null se já está no máximo
 * 
 * @example
 * ```typescript
 * const next = getNextDifficulty('medio'); // 'dificil'
 * ```
 */
export const getNextDifficulty = (
  currentLevel: DifficultyLevel
): DifficultyLevel | null => {
  const currentIndex = getDifficultyIndex(currentLevel);
  
  if (currentIndex >= DIFFICULTY_LEVELS.length - 1) {
    return null;
  }
  
  return DIFFICULTY_LEVELS[currentIndex + 1].level;
};

/**
 * Obtém o nível anterior de dificuldade.
 * 
 * @param currentLevel - Nível atual
 * @returns Nível anterior ou null se já está no mínimo
 * 
 * @example
 * ```typescript
 * const prev = getPreviousDifficulty('dificil'); // 'medio'
 * ```
 */
export const getPreviousDifficulty = (
  currentLevel: DifficultyLevel
): DifficultyLevel | null => {
  const currentIndex = getDifficultyIndex(currentLevel);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return DIFFICULTY_LEVELS[currentIndex - 1].level;
};

/**
 * Constantes de progressão de dificuldade.
 */
export const DIFFICULTY_PROGRESSION = {
  /** Acertos consecutivos necessários para subir de nível */
  CORRECT_THRESHOLD: 3,
  /** Erros consecutivos necessários para descer de nível */
  INCORRECT_THRESHOLD: 2,
  /** Nível inicial para novos jogadores */
  INITIAL_LEVEL: 'muito_facil' as DifficultyLevel
} as const;
