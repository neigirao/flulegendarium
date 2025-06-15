
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";

interface UseSimpleGameLogicProps {
  currentPlayer: Player | null;
  onCorrectGuess: (points: number) => void;
  onIncorrectGuess: () => void;
  onNextPlayer: () => void;
}

export const useSimpleGameLogic = ({
  currentPlayer,
  onCorrectGuess,
  onIncorrectGuess,
  onNextPlayer
}: UseSimpleGameLogicProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess.trim() || isProcessing) {
      console.log('🚫 Condições não atendidas para processar palpite');
      return;
    }
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessing(true);
    
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
        
        // Aguarda um momento e vai para o próximo jogador
        setTimeout(() => {
          console.log('🔄 Indo para próximo jogador...');
          onNextPlayer();
          setIsProcessing(false);
        }, 1500);
        
      } else {
        console.log('❌ ERROU! Resposta:', guess, 'Correto:', currentPlayer.name);
        
        onIncorrectGuess();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}.`,
        });
        
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessing(false);
    }
  }, [currentPlayer, isProcessing, onCorrectGuess, onIncorrectGuess, onNextPlayer, toast]);

  return {
    handleGuess,
    isProcessing
  };
};
