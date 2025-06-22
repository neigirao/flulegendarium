
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";

interface UseGameLogicProps {
  currentPlayer: Player | null;
  gameOver: boolean;
  gameActive: boolean;
  onCorrectGuess: (points: number) => void;
  onIncorrectGuess: () => void;
  onGameEnd: () => void;
  selectRandomPlayer: () => void;
  stopTimer: () => void;
  startTimer: () => void;
}

interface UseGameLogicReturn {
  handleGuess: (guess: string) => Promise<void>;
  isProcessingGuess: boolean;
}

export const useGameLogic = ({
  currentPlayer,
  gameOver,
  gameActive,
  onCorrectGuess,
  onIncorrectGuess,
  onGameEnd,
  selectRandomPlayer,
  stopTimer,
  startTimer
}: UseGameLogicProps): UseGameLogicReturn => {
  const { toast } = useToast();
  const [isProcessingGuess, setIsProcessingGuess] = useState<boolean>(false);

  const handleGuess = useCallback(async (guess: string): Promise<void> => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess || !gameActive) return;
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessingGuess(true);
    
    try {
      const isCorrect: boolean = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        const points: number = 5;
        console.log('🎯 ACERTOU! Pontos ganhos:', points);
        
        stopTimer();
        onCorrectGuess(points);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou! +${points} pontos`,
        });
        
        console.log('🔄 Preparando próximo jogador...');
        setTimeout(() => {
          console.log('🔄 Selecionando próximo jogador após acerto...');
          selectRandomPlayer();
          setTimeout(() => {
            startTimer();
          }, 100);
          setIsProcessingGuess(false);
        }, 800);
      } else {
        console.log('❌ ERROU! Resposta:', guess, 'Esperado:', currentPlayer.name);
        
        onIncorrectGuess();
        onGameEnd();
        stopTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}.`,
        });
        
        setIsProcessingGuess(false);
      }
    } catch (error: unknown) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, gameActive, isProcessingGuess, onCorrectGuess, onIncorrectGuess, onGameEnd, selectRandomPlayer, stopTimer, startTimer, toast]);

  return {
    handleGuess,
    isProcessingGuess
  };
};
