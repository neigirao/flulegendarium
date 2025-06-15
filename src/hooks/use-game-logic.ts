
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
}

export const useGameLogic = ({
  currentPlayer,
  gameOver,
  gameActive,
  onCorrectGuess,
  onIncorrectGuess,
  onGameEnd,
  selectRandomPlayer,
  stopTimer
}: UseGameLogicProps) => {
  const { toast } = useToast();
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);

  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess || !gameActive) return;
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessingGuess(true);
    
    try {
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        const points = 5;
        console.log('🎯 ACERTOU! Pontos ganhos:', points);
        
        // Para o timer primeiro
        stopTimer();
        
        // Atualiza pontuação
        onCorrectGuess(points);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou! +${points} pontos`,
        });
        
        // Seleciona próximo jogador imediatamente após acertar
        console.log('🔄 Selecionando próximo jogador...');
        setTimeout(() => {
          selectRandomPlayer();
          setIsProcessingGuess(false);
        }, 1500); // Reduzido de 2000 para 1500ms
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
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, gameActive, isProcessingGuess, onCorrectGuess, onIncorrectGuess, onGameEnd, selectRandomPlayer, stopTimer, toast]);

  return {
    handleGuess,
    isProcessingGuess
  };
};
