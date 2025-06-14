
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { usePlayerSelection } from "./use-player-selection";
import { useGameTimer, TIME_LIMIT_SECONDS } from "./use-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { processPlayerName, isCorrectGuess } from "@/utils/name-processor";
import { useAnalytics } from "./use-analytics";
import { useAchievements } from "./use-achievements";
import { useAuth } from "./useAuth";

export const MAX_ATTEMPTS = 1;

export const useGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackEvent, trackCorrectGuess, trackIncorrectGuess } = useAnalytics();
  const { checkAndUnlockAchievements } = useAchievements();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  // Player selection hook
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed } = usePlayerSelection(players);
  
  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      setCurrentStreak(0);
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, gameActive]);

  // Handle tab change callback
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      setCurrentStreak(0);
    }
  }, [gameActive, gameOver]);
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useGameTimer(gameOver, handleTimeUp);

  // Start timer when a new player is selected
  const startGameForPlayer = useCallback(() => {
    if (currentPlayer && !gameOver && !isRunning) {
      console.log('🎮 Iniciando timer para:', currentPlayer.name);
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      startTimer();
    }
  }, [currentPlayer, gameOver, isRunning, startTimer]);

  // Reset score function
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    setScore(0);
    setCurrentStreak(0);
    setGamesPlayed(0);
    setGameActive(false);
  }, []);

  // Handle guess submission
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess || !gameActive) return;
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessingGuess(true);
    
    try {
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      
      if (isCorrect) {
        const points = 5;
        const newScore = score + points;
        const newStreak = currentStreak + 1;
        const newGamesPlayed = gamesPlayed + 1;
        
        console.log('🎯 ACERTOU! Novo score:', newScore);
        
        setScore(newScore);
        setCurrentStreak(newStreak);
        setGamesPlayed(newGamesPlayed);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou! Pontuação: ${newScore}`,
        });
        
        stopTimer();
        setGameActive(false);
        
        setTimeout(() => {
          selectRandomPlayer();
        }, 2000);
      } else {
        console.log('❌ ERROU! Resposta:', guess, 'Esperado:', currentPlayer.name);
        setGameOver(true);
        setHasLost(true);
        setGameActive(false);
        setCurrentStreak(0);
        
        stopTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
        });
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
    } finally {
      setIsProcessingGuess(false);
    }
  }, [currentPlayer, gameOver, stopTimer, selectRandomPlayer, toast, isProcessingGuess, score, gameActive, currentStreak, gamesPlayed]);

  return {
    currentPlayer,
    attempts: 0,
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
    startGameForPlayer,
    isTimerRunning: isRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak: Math.max(currentStreak, 0)
  };
};
