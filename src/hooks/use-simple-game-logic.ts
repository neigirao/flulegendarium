import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { isCorrectGuess } from "@/utils/name-processor";
import { logger } from "@/utils/logger";

interface UseSimpleGameLogicProps {
  currentPlayer: Player | null;
  onCorrectGuess: (points: number) => void;
  onIncorrectGuess: (guess: string) => void;
  onGameEnd: () => void;
  selectRandomPlayer: () => void;
  stopTimer: () => void;
  startTimer: () => void; // Adicionado para reiniciar o timer
}

export const useSimpleGameLogic = ({
  currentPlayer,
  onCorrectGuess,
  onIncorrectGuess,
  onGameEnd,
  selectRandomPlayer,
  stopTimer,
  startTimer
}: UseSimpleGameLogicProps) => {
  const { toast } = useToast();
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);

  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess.trim() || isProcessingGuess) {
      logger.debug('Condições não atendidas para processar palpite', 'GAME_LOGIC');
      return;
    }
    
    logger.debug(`Processando palpite: ${guess} para: ${currentPlayer.name}`, 'GAME_LOGIC');
    setIsProcessingGuess(true);
    
    try {
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        logger.info(`ACERTOU! ${currentPlayer.name}`, 'GAME_LOGIC');
        
        const points = 5;
        onCorrectGuess(points);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou ${currentPlayer.name}! +${points} pontos`,
        });
        
        stopTimer();
        
        // Aguarda um momento e vai para o próximo jogador COM TIMER REINICIADO
        setTimeout(() => {
          logger.debug('Indo para próximo jogador e reiniciando timer', 'GAME_LOGIC');
          selectRandomPlayer();
          // Reiniciar o timer do zero para o próximo jogador
          setTimeout(() => {
            startTimer();
          }, 100);
          setIsProcessingGuess(false);
        }, 1500);
        
      } else {
        logger.info(`ERROU! Resposta: ${guess}, Correto: ${currentPlayer.name}`, 'GAME_LOGIC');
        
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
      logger.error('Erro ao processar palpite', 'GAME_LOGIC', error);
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, isProcessingGuess, onCorrectGuess, onIncorrectGuess, onGameEnd, selectRandomPlayer, stopTimer, startTimer, toast]);

  return {
    handleGuess,
    isProcessingGuess
  };
};
