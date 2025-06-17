
import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { useGameTimer, TIME_LIMIT_SECONDS } from "./use-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { useEnhancedPlayerSelection } from "./use-enhanced-player-selection";
import { useGameSession } from "./use-game-session";
import { useGameScore } from "./use-game-score";
import { useGameLogic } from "./use-game-logic";

export const MAX_ATTEMPTS = 1;

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  // Enhanced player selection hook
  const { 
    currentPlayer, 
    gameKey, 
    selectRandomPlayer, 
    forceRefresh,
    handlePlayerImageFixed,
    playerChangeCount 
  } = useEnhancedPlayerSelection(players);

  const { sessionId, registerGameStart, resetSession } = useGameSession();
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();

  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, gameActive, resetStreak]);

  // Handle tab change callback
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
    }
  }, [gameActive, gameOver, resetStreak]);
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useGameTimer(gameOver, handleTimeUp);

  // Game logic hook
  const { handleGuess, isProcessingGuess } = useGameLogic({
    currentPlayer,
    gameOver,
    gameActive,
    onCorrectGuess: (points: number) => {
      console.log('✅ Resposta correta! Adicionando pontos:', points);
      addScore(points);
    },
    onIncorrectGuess: () => {
      resetStreak();
    },
    onGameEnd: () => {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
    },
    selectRandomPlayer,
    stopTimer
  });

  // Start timer when a new player is selected and game is not over
  const startGameForPlayer = useCallback(async () => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando timer para:', currentPlayer.name);
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      
      // Register game start only once per session
      if (!sessionId) {
        await registerGameStart();
      }
      
      // Aguarda um momento antes de iniciar timer para garantir que o componente renderizou
      setTimeout(() => {
        if (!isRunning) {
          startTimer();
        }
      }, 100);
    }
  }, [currentPlayer, gameOver, isRunning, startTimer, sessionId, registerGameStart]);

  // Reset score function
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetSession();
  }, [resetAll, resetSession]);

  return {
    currentPlayer,
    gameKey,
    attempts: [],
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    isProcessingGuess,
    TIME_LIMIT_SECONDS,
    hasLost,
    startGameForPlayer,
    isTimerRunning: isRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    playerChangeCount
  };
};
