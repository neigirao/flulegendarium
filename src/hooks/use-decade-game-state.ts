import { useState, useCallback } from "react";
import { DIFFICULTY_LEVELS, type DifficultyLevelConfig } from "@/config/difficulty-levels";

/**
 * Hook de gerenciamento de estado do jogo por década.
 * 
 * Controla pontuação, tentativas, streaks e dificuldade adaptativa
 * para o modo Quiz por Década.
 * 
 * ### Sistema de Dificuldade
 * - Começa em "Muito Fácil"
 * - Aumenta após 3 acertos consecutivos
 * - Diminui após 2 erros consecutivos
 * - Afeta multiplicador de pontos
 * 
 * ### Tentativas
 * - Máximo de 1 tentativa por jogador (modo competitivo)
 * - Game over ao errar
 * 
 * @returns {Object} Estado e ações do jogo
 * @returns {number} score - Pontuação total
 * @returns {boolean} gameOver - Se o jogo terminou
 * @returns {number} currentStreak - Sequência de acertos
 * @returns {DifficultyLevelConfig} currentDifficulty - Dificuldade atual
 * @returns {Function} addScore - Adiciona pontos (com multiplicador)
 * @returns {Function} resetGame - Reseta o jogo
 * @returns {Function} incrementAttempts - Incrementa tentativas
 * 
 * @example
 * ```tsx
 * const {
 *   score,
 *   gameOver,
 *   addScore,
 *   currentDifficulty
 * } = useDecadeGameState();
 * 
 * // Adicionar pontos com multiplicador de dificuldade
 * addScore(5); // Se dificuldade for 1.5x, adiciona 7.5 (arredonda para 8)
 * ```
 */
export const useDecadeGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  // Adaptive difficulty state - Start with "muito_facil"
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0]);
  const [difficultyProgress, setDifficultyProgress] = useState(0);
  const [correctSequence, setCorrectSequence] = useState(0);
  const [incorrectSequence, setIncorrectSequence] = useState(0);
  
  const MAX_ATTEMPTS = 1; // Only one attempt like adaptive game

  const adjustDifficulty = useCallback((wasCorrect: boolean) => {
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

    // Increase difficulty after 3 consecutive correct answers
    if (newCorrectSequence >= 3 && currentIndex < DIFFICULTY_LEVELS.length - 1) {
      newDifficultyIndex = currentIndex + 1;
    }
    // Decrease difficulty after 2 consecutive wrong answers
    else if (newIncorrectSequence >= 2 && currentIndex > 0) {
      newDifficultyIndex = currentIndex - 1;
    }

    if (newDifficultyIndex !== currentIndex) {
      const newDifficulty = DIFFICULTY_LEVELS[newDifficultyIndex];
      setCurrentDifficulty(newDifficulty);
      setDifficultyProgress(0);
      
      console.log(`🎯 Dificuldade alterada: ${currentDifficulty.label} → ${newDifficulty.label}`);
      
      // Reset sequences after difficulty change
      setCorrectSequence(0);
      setIncorrectSequence(0);
    } else {
      // Update progress within current difficulty
      const progress = wasCorrect ? 
        Math.min(100, (newCorrectSequence / 3) * 100) : 
        Math.max(0, 100 - (newIncorrectSequence / 2) * 100);
      setDifficultyProgress(progress);
    }
  }, [currentDifficulty, correctSequence, incorrectSequence]);

  const addScore = useCallback((points: number) => {
    const adjustedPoints = Math.round(points * currentDifficulty.multiplier);
    setScore(prev => prev + adjustedPoints);
    setCurrentStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    adjustDifficulty(true);
  }, [currentDifficulty.multiplier, adjustDifficulty]);

  const endGame = useCallback(() => {
    setGameOver(true);
    setGamesPlayed(prev => prev + 1);
  }, []);

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

  const incrementAttempts = useCallback(() => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        endGame();
      }
      return newAttempts;
    });
  }, [endGame]);

  const resetStreak = useCallback(() => {
    setCurrentStreak(0);
    adjustDifficulty(false);
  }, [adjustDifficulty]);

  return {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    MAX_ATTEMPTS,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed,
    // Adaptive difficulty
    currentDifficulty,
    difficultyProgress,
    adjustDifficulty,
    DIFFICULTY_LEVELS
  };
};
