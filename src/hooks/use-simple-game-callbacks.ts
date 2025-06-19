
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player, GameProgressInfo } from "@/types/guess-game";

interface UseSimpleGameCallbacksProps {
  currentPlayer: Player | null;
  gameActive: boolean;
  gameOver: boolean;
  score: number;
  endGame: (lost: boolean) => void;
  resetStreak: () => void;
  saveGameData: (finalScore: number, isCorrect: boolean) => Promise<void>;
  setGameProgress: (progress: GameProgressInfo | ((prev: GameProgressInfo) => GameProgressInfo)) => void;
  addScore: (points: number) => void;
  incrementCorrectGuesses: () => void;
  incrementAttempts: () => void;
}

export const useSimpleGameCallbacks = ({
  currentPlayer,
  gameActive,
  gameOver,
  score,
  endGame,
  resetStreak,
  saveGameData,
  setGameProgress,
  addScore,
  incrementCorrectGuesses,
  incrementAttempts
}: UseSimpleGameCallbacksProps) => {
  const { toast } = useToast();

  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      endGame(true);
      resetStreak();
      
      saveGameData(score, false);
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, gameActive, endGame, resetStreak, saveGameData]);

  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      endGame(true);
      resetStreak();
      saveGameData(score, false);
    }
  }, [gameActive, gameOver, endGame, resetStreak, saveGameData, score]);

  const handleCorrectGuess = useCallback((points: number) => {
    console.log('✅ Resposta correta! Adicionando pontos:', points);
    incrementCorrectGuesses();
    addScore(points);
    
    // Update game progress
    setGameProgress(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentStreak: prev.currentStreak + 1
    }));
    
    saveGameData(score + points, true);
  }, [incrementCorrectGuesses, addScore, setGameProgress, saveGameData, score]);

  const handleIncorrectGuess = useCallback((guess: string) => {
    console.log('❌ Resposta incorreta');
    incrementAttempts();
    resetStreak();
    
    endGame(true);
    saveGameData(score, false);
  }, [incrementAttempts, resetStreak, endGame, saveGameData, score]);

  const handleGameEnd = useCallback(() => {
    endGame(true);
  }, [endGame]);

  return {
    handleTimeUp,
    handleTabChange,
    handleCorrectGuess,
    handleIncorrectGuess,
    handleGameEnd
  };
};
