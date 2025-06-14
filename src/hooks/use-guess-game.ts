
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
  
  // Player selection hook
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed } = usePlayerSelection(players);
  
  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer) {
      setGameOver(true);
      setHasLost(true); // Set hasLost when time is up
      
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

  // Handle guess submission
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess) return;
    
    setIsProcessingGuess(true);
    
    try {
      // First try with the enhanced function that checks nicknames
      const processingResult = await processPlayerName(guess, currentPlayer.name, currentPlayer.id);
      
      // Check if we got a match and if it matches our current player
      let isCorrect = false;
      
      if (processingResult.processedName) {
        isCorrect = processingResult.processedName.toLowerCase() === currentPlayer.name.toLowerCase();
      }
      
      // If no match from the enhanced function, try local fallback
      if (!isCorrect) {
        isCorrect = isCorrectGuess(guess, currentPlayer.name);
      }
      
      if (isCorrect) {
        // Correct guess!
        const points = 5; // Always award 5 points since we only have one attempt now
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
        
        // Clear the timer
        clearGameTimer();
        
        selectRandomPlayer();
      } else {
        // Wrong guess - game over immediately
        setGameOver(true);
        setHasLost(true); // Explicitly set hasLost when guess is incorrect
        
        trackIncorrectGuess(currentPlayer.name, guess);
        
        // Clear the timer
        clearGameTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      
      // Fallback to basic matching if there's an error
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
        setHasLost(true); // Ensure hasLost is set when guess fails
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
    setHasLost(false); // Reset hasLost
    startTimer();
  }, [startTimer]);
  
  // Effect to handle state changes when a new player is selected - ONLY fire once per player
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      trackEvent({
        action: 'new_player_shown',
        category: 'Game',
        label: currentPlayer.name
      });
      resetGameForNewRound();
    }
  }, [currentPlayer?.id, gameOver]); // Only depend on player ID and gameOver to prevent loops

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
    hasLost // Export hasLost state
  };
};
