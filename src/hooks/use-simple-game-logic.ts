
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";

interface UseSimpleGameLogicProps {
  currentPlayer: Player | null;
  onCorrectGuess: (points: number) => void;
  onIncorrectGuess: (guess: string) => void;
  onGameEnd: () => void;
  selectRandomPlayer: () => void;
  stopTimer: () => void;
}

export const useSimpleGameLogic = ({
  currentPlayer,
  onCorrectGuess,
  onIncorrectGuess,
  onGameEnd,
  selectRandomPlayer,
  stopTimer
}: UseSimpleGameLogicProps) => {
  const { toast } = useToast();
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);

  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess.trim() || isProcessingGuess) {
      console.log('🚫 Condições não atendidas para processar palpite');
      return;
    }
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessingGuess(true);
    
    try {
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        console.log('🎯 ACERTOU!', currentPlayer.name);
        
        const points = 5;
        onCorrectGuess(points);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou ${currentPlayer.name}! +${points} pontos`,
        });
        
        stopTimer();
        
        // Aguarda um momento e vai para o próximo jogador
        setTimeout(() => {
          console.log('🔄 Indo para próximo jogador...');
          selectRandomPlayer();
          setIsProcessingGuess(false);
        }, 1500);
        
      } else {
        console.log('❌ ERROU! Resposta:', guess, 'Correto:', currentPlayer.name);
        
        onIncorrectGuess(guess);
        onGameEnd();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}.`,
        });
        
        stopTimer();
        setIsProcessingGuess(false);
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, isProcessingGuess, onCorrectGuess, onIncorrectGuess, onGameEnd, selectRandomPlayer, stopTimer, toast]);

  return {
    handleGuess,
    isProcessingGuess
  };
};
