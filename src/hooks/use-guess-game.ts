
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
  const [imageLoaded, setImageLoaded] = useState(false);
  
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

  // Callback para quando a imagem for carregada
  const handleImageLoaded = useCallback(() => {
    console.log('🎮 Imagem carregada, iniciando timer');
    setImageLoaded(true);
    if (currentPlayer && !gameOver) {
      startTimer();
      trackEvent({
        action: 'new_player_shown',
        category: 'Game',
        label: currentPlayer.name
      });
    }
  }, [currentPlayer, gameOver, startTimer, trackEvent]);

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

  // Reset game state for a new round
  const resetGameForNewRound = useCallback(() => {
    setAttempts(0);
    setGameOver(false);
    setHasLost(false);
    setImageLoaded(false);
  }, []);

  // Effect to handle state changes when a new player is selected
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      resetGameForNewRound();
    }
  }, [currentPlayer?.id, gameOver, resetGameForNewRound]);

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
    handleImageLoaded
  };
};
