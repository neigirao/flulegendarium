import { useState, useCallback, useMemo } from "react";
import { DIFFICULTY_LEVELS, type DifficultyLevelConfig } from "@/config/difficulty-levels";
import { logger } from "@/utils/logger";

/**
 * Configuração base para o hook de estado do jogo
 */
export interface BaseGameConfig {
  /** Número máximo de tentativas permitidas */
  maxAttempts: number;
  /** Se deve usar sistema de dificuldade adaptativa */
  useAdaptiveDifficulty: boolean;
  /** Pontos base por acerto (antes de multiplicador) */
  basePoints: number;
  /** Sequência de acertos necessária para aumentar dificuldade */
  correctSequenceThreshold?: number;
  /** Sequência de erros necessária para diminuir dificuldade */
  incorrectSequenceThreshold?: number;
}

/**
 * Estado retornado pelo hook base de gerenciamento de jogo
 */
export interface BaseGameState {
  // Score
  score: number;
  addScore: (points: number) => void;
  
  // Game Status
  gameOver: boolean;
  endGame: () => void;
  resetGame: () => void;
  
  // Attempts
  attempts: number;
  incrementAttempts: () => void;
  maxAttempts: number;
  
  // Streaks
  currentStreak: number;
  maxStreak: number;
  resetStreak: () => void;
  
  // Statistics
  gamesPlayed: number;
  
  // Adaptive Difficulty (opcional)
  currentDifficulty: DifficultyLevelConfig;
  difficultyProgress: number;
  adjustDifficulty: (wasCorrect: boolean) => void;
}

const DEFAULT_CONFIG: BaseGameConfig = {
  maxAttempts: 1,
  useAdaptiveDifficulty: true,
  basePoints: 5,
  correctSequenceThreshold: 3,
  incorrectSequenceThreshold: 2,
};

/**
 * Hook base para gerenciamento de estado do jogo.
 * 
 * Centraliza lógica comum de pontuação, tentativas, streaks e dificuldade adaptativa.
 * Pode ser especializado para diferentes modos de jogo.
 * 
 * @param {BaseGameConfig} config - Configuração do jogo
 * @returns {BaseGameState} Estado e ações do jogo
 * 
 * @example
 * ```tsx
 * const gameState = useBaseGameState({
 *   maxAttempts: 3,
 *   useAdaptiveDifficulty: true,
 *   basePoints: 5
 * });
 * 
 * // Adicionar pontos
 * gameState.addScore(5);
 * 
 * // Incrementar tentativas
 * gameState.incrementAttempts();
 * 
 * // Ajustar dificuldade
 * gameState.adjustDifficulty(true);
 * ```
 */
export const useBaseGameState = (config: Partial<BaseGameConfig> = {}): BaseGameState => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), []);
  
  // Score State
  const [score, setScore] = useState(0);
  
  // Game Status
  const [gameOver, setGameOver] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  // Attempts
  const [attempts, setAttempts] = useState(0);
  
  // Streaks
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Adaptive Difficulty
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0]);
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);

  /**
   * Ajusta a dificuldade baseado no desempenho
   */
  const adjustDifficulty = useCallback((wasCorrect: boolean) => {
    if (!finalConfig.useAdaptiveDifficulty) return;

    let newCorrectSequence = correctSequence;
    let newIncorrectSequence = incorrectSequence;
    
    if (wasCorrect) {
      newCorrectSequence = correctSequence + 1;
      newIncorrectSequence = 0;
    } else {
      newCorrectSequence = 0;
      newIncorrectSequence = incorrectSequence + 1;
    }

    setCorrectSequence(newCorrectSequence);
    setIncorrectSequence(newIncorrectSequence);

    const currentIndex = DIFFICULTY_LEVELS.findIndex(d => d.level === currentDifficulty.level);
    let newDifficultyIndex = currentIndex;

    // Increase difficulty after threshold consecutive correct answers
    if (newCorrectSequence >= (finalConfig.correctSequenceThreshold || 3) && currentIndex < DIFFICULTY_LEVELS.length - 1) {
      newDifficultyIndex = currentIndex + 1;
    }
    // Decrease difficulty after threshold consecutive wrong answers
    else if (newIncorrectSequence >= (finalConfig.incorrectSequenceThreshold || 2) && currentIndex > 0) {
      newDifficultyIndex = currentIndex - 1;
    }

    if (newDifficultyIndex !== currentIndex) {
      const newDifficulty = DIFFICULTY_LEVELS[newDifficultyIndex];
      setCurrentDifficulty(newDifficulty);
      setDifficultyProgress(0);
      
      logger.info(`Dificuldade alterada`, 'AdaptiveDifficulty', { 
        from: currentDifficulty.label, 
        to: newDifficulty.label 
      });
      
      // Reset sequences after difficulty change
      setCorrectSequence(0);
      setIncorrectSequence(0);
    } else {
      // Update progress within current difficulty
      const progress = wasCorrect ? 
        Math.min(100, (newCorrectSequence / (finalConfig.correctSequenceThreshold || 3)) * 100) : 
        Math.max(0, 100 - (newIncorrectSequence / (finalConfig.incorrectSequenceThreshold || 2)) * 100);
      setDifficultyProgress(progress);
    }
  }, [currentDifficulty, correctSequence, incorrectSequence, finalConfig]);

  /**
   * Adiciona pontos ao score com multiplicador de dificuldade
   */
  const addScore = useCallback((points: number) => {
    const multiplier = finalConfig.useAdaptiveDifficulty ? currentDifficulty.multiplier : 1;
    const adjustedPoints = Math.round(points * multiplier);
    
    setScore(prev => prev + adjustedPoints);
    setCurrentStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    
    if (finalConfig.useAdaptiveDifficulty) {
      adjustDifficulty(true);
    }
  }, [currentDifficulty.multiplier, adjustDifficulty, finalConfig]);

  /**
   * Finaliza o jogo
   */
  const endGame = useCallback(() => {
    setGameOver(true);
    setGamesPlayed(prev => prev + 1);
  }, []);

  /**
   * Reseta o estado do jogo para uma nova partida
   */
  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setAttempts(0);
    setCurrentStreak(0);
    setCurrentDifficulty(DIFFICULTY_LEVELS[0]);
    setDifficultyProgress(0);
    setCorrectSequence(0);
    setIncorrectSequence(0);
    // maxStreak e gamesPlayed persistem entre partidas
  }, []);

  /**
   * Incrementa tentativas e verifica game over
   */
  const incrementAttempts = useCallback(() => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= finalConfig.maxAttempts) {
        endGame();
      }
      return newAttempts;
    });
  }, [endGame, finalConfig.maxAttempts]);

  /**
   * Reseta streak e ajusta dificuldade (chamado em erro)
   */
  const resetStreak = useCallback(() => {
    setCurrentStreak(0);
    if (finalConfig.useAdaptiveDifficulty) {
      adjustDifficulty(false);
    }
  }, [adjustDifficulty, finalConfig]);

  return {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    maxAttempts: finalConfig.maxAttempts,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed,
    currentDifficulty,
    difficultyProgress,
    adjustDifficulty,
  };
};
