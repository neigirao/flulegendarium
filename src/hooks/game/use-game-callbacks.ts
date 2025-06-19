
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";

interface UseGameCallbacksProps {
  gameActive: boolean;
  gameOver: boolean;
  currentPlayer: Player | null;
  score: number;
  endGame: (lost: boolean) => void;
  resetStreak: () => void;
  saveGameData: (finalScore: number, isCorrect: boolean) => Promise<void>;
}

export const useGameCallbacks = ({
  gameActive,
  gameOver,
  currentPlayer,
  score,
  endGame,
  resetStreak,
  saveGameData
}: UseGameCallbacksProps) => {
  const { toast } = useToast();

  // Handle time up callback
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
  }, [currentPlayer, gameOver, score, toast, gameActive, resetStreak, saveGameData, endGame]);

  // Handle tab change callback
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      endGame(true);
      resetStreak();
      saveGameData(score, false);
    }
  }, [gameActive, gameOver, resetStreak, saveGameData, score, endGame]);

  return {
    handleTimeUp,
    handleTabChange
  };
};
