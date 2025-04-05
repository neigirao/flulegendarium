
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { usePlayerSelection } from "./use-player-selection";
import { useGameTimer, TIME_LIMIT_SECONDS } from "./use-game-timer";
import { processPlayerName, isCorrectGuess } from "@/utils/name-processor";

export const MAX_ATTEMPTS = 1;

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  
  // Player selection hook
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed } = usePlayerSelection(players);
  
  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer) {
      setGameOver(true);
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}`,
      });
    }
  }, [currentPlayer, gameOver, toast]);
  
  // Game timer hook
  const { timeRemaining, startTimer, clearGameTimer } = useGameTimer(gameOver, handleTimeUp);

  // Initialize game when players data is loaded
  useEffect(() => {
    if (players?.length > 0 && !currentPlayer) {
      console.log("Selecionando jogador aleatório entre", players.length, "jogadores");
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  // Handle guess submission
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess) return;
    
    setIsProcessingGuess(true);
    
    try {
      // First try with the edge function
      const processingResult = await processPlayerName(guess);
      
      // Check if we got a match and if it matches our current player
      let isCorrect = false;
      
      if (processingResult.processedName) {
        isCorrect = processingResult.processedName.toLowerCase() === currentPlayer.name.toLowerCase();
      }
      
      // If no match from the edge function, try local fallback
      if (!isCorrect) {
        isCorrect = isCorrectGuess(guess, currentPlayer.name);
      }
      
      if (isCorrect) {
        // Correct guess!
        const points = 5; // Always award 5 points since we only have one attempt now
        setScore(prev => prev + points);
        
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
        
        toast({
          title: "Parabéns!",
          description: `Você acertou e ganhou ${points} pontos!`,
        });
        
        clearGameTimer();
        selectRandomPlayer();
      } else {
        setGameOver(true);
        clearGameTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    } finally {
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, clearGameTimer, selectRandomPlayer, toast, isProcessingGuess]);

  // Reset game state for a new round
  const resetGameForNewRound = useCallback(() => {
    setAttempts(0);
    setGameOver(false);
    startTimer();
  }, [startTimer]);
  
  // Effect to handle state changes when a new player is selected
  useEffect(() => {
    if (currentPlayer) {
      resetGameForNewRound();
    }
  }, [currentPlayer, resetGameForNewRound]);

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
    TIME_LIMIT_SECONDS
  };
};
