
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { usePlayerSelection } from "./use-player-selection";
import { useGameTimer, TIME_LIMIT_SECONDS } from "./use-game-timer";
import { processPlayerName, isCorrectGuess } from "@/utils/name-processor";
import { useAnalytics } from "./use-analytics";

export const MAX_ATTEMPTS = 1;

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const { trackEvent, trackCorrectGuess, trackIncorrectGuess } = useAnalytics();
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  // Player selection hook
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed } = usePlayerSelection(players);
  
  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer) {
      setGameOver(true);
      setHasLost(true);
      
      trackEvent({
        action: 'game_timeout',
        category: 'Game',
        label: currentPlayer.name
      });
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}`,
      });
    }
  }, [currentPlayer, gameOver, toast, trackEvent]);
  
  // Game timer hook
  const { timeRemaining, startTimer, clearGameTimer } = useGameTimer(gameOver, handleTimeUp);

  // Start timer only when a NEW player is selected
  useEffect(() => {
    if (currentPlayer && currentPlayer.id !== currentPlayerId && !gameOver) {
      console.log('🎮 Novo jogador detectado, iniciando timer:', currentPlayer.name);
      setCurrentPlayerId(currentPlayer.id);
      
      // Reset states for new player
      setAttempts(0);
      setGameOver(false);
      setHasLost(false);
      
      // Start timer after a brief delay to ensure UI is ready
      const timeoutId = setTimeout(() => {
        startTimer();
        trackEvent({
          action: 'new_player_shown',
          category: 'Game',
          label: currentPlayer.name
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer?.id, currentPlayerId, gameOver, startTimer, trackEvent]);

  // Handle guess submission
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess) return;
    
    setIsProcessingGuess(true);
    
    try {
      const processingResult = await processPlayerName(guess, currentPlayer.name, currentPlayer.id);
      
      let isCorrect = false;
      
      if (processingResult.processedName) {
        isCorrect = processingResult.processedName.toLowerCase() === currentPlayer.name.toLowerCase();
      }
      
      if (!isCorrect) {
        isCorrect = isCorrectGuess(guess, currentPlayer.name);
      }
      
      if (isCorrect) {
        const points = 5;
        setScore(prev => prev + points);
        
        trackCorrectGuess(currentPlayer.name);
        trackEvent({
          action: 'points_earned',
          category: 'Game',
          label: currentPlayer.name,
          value: points
        });
        
        toast({
          title: "Parabéns!",
          description: `Você acertou e ganhou ${points} pontos!`,
        });
        
        clearGameTimer();
        selectRandomPlayer();
      } else {
        setGameOver(true);
        setHasLost(true);
        
        trackIncorrectGuess(currentPlayer.name, guess);
        
        clearGameTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      
      if (isCorrectGuess(guess, currentPlayer.name)) {
        const points = 5;
        setScore(prev => prev + points);
        
        trackCorrectGuess(currentPlayer.name);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou e ganhou ${points} pontos!`,
        });
        
        clearGameTimer();
        selectRandomPlayer();
      } else {
        setGameOver(true);
        setHasLost(true);
        clearGameTimer();
        
        trackIncorrectGuess(currentPlayer.name, guess);
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    } finally {
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, clearGameTimer, selectRandomPlayer, toast, isProcessingGuess, trackCorrectGuess, trackIncorrectGuess, trackEvent]);

  return {
    currentPlayer,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    isProcessingGuess,
    TIME_LIMIT_SECONDS,
    hasLost,
    handleImageLoaded: () => {} // Removido pois não é mais necessário
  };
};
