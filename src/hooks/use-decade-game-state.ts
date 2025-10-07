import { useBaseGameState } from "./game/use-base-game-state";
import { DIFFICULTY_LEVELS } from "@/config/difficulty-levels";

/**
 * Hook de gerenciamento de estado do jogo por década.
 * 
 * Especialização do useBaseGameState para o modo Quiz por Década.
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
 * @deprecated Use `useBaseGameState` diretamente para novos componentes
 * @returns {Object} Estado e ações do jogo
 * 
 * @example
 * ```tsx
 * const {
 *   score,
 *   gameOver,
 *   addScore,
 *   currentDifficulty
 * } = useDecadeGameState();
 * ```
 */
export const useDecadeGameState = () => {
  const gameState = useBaseGameState({
    maxAttempts: 1,
    useAdaptiveDifficulty: true,
    basePoints: 5,
    correctSequenceThreshold: 3,
    incorrectSequenceThreshold: 2,
  });

  return {
    ...gameState,
    MAX_ATTEMPTS: gameState.maxAttempts,
    DIFFICULTY_LEVELS,
  };
};
