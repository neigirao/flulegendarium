
import { useCallback } from "react";
import { Player, GameProgressInfo } from "@/types/guess-game";
import { useSimpleGameLogic } from "@/hooks/use-simple-game-logic";

interface UseEnhancedGameLogicProps {
  currentPlayer: Player | null;
  gameProgress: GameProgressInfo;
  updateGameProgress: (updates: Partial<GameProgressInfo>) => void;
  addScore: (points: number) => void;
  resetStreak: () => void;
  endGame: (lost: boolean) => void;
  saveGameData: (finalScore: number, isCorrect: boolean) => Promise<void>;
  incrementCorrectGuesses: () => void;
  incrementTotalAttempts: () => void;
  selectRandomPlayer: () => void;
  score: number;
}

export const useEnhancedGameLogic = ({
  currentPlayer,
  gameProgress,
  updateGameProgress,
  addScore,
  resetStreak,
  endGame,
  saveGameData,
  incrementCorrectGuesses,
  incrementTotalAttempts,
  selectRandomPlayer,
  score
}: UseEnhancedGameLogicProps) => {
  
  const { handleGuess, isProcessing } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: (points: number) => {
      console.log('✅ Resposta correta! Adicionando pontos:', points);
      incrementCorrectGuesses();
      addScore(points);
      
      // Update game progress
      updateGameProgress({
        currentRound: gameProgress.currentRound + 1,
        currentStreak: gameProgress.currentStreak + 1
      });
      
      saveGameData(score + points, true);
    },
    onIncorrectGuess: (guess: string) => {
      console.log('❌ Resposta incorreta');
      incrementTotalAttempts();
      resetStreak();
      
      endGame(true);
      saveGameData(score, false);
    },
    onNextPlayer: selectRandomPlayer
  });

  return {
    handleGuess,
    isProcessing
  };
};
