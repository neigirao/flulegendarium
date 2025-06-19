
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player, GameProgressInfo, DifficultyLevel } from "@/types/guess-game";
import { useSimpleGameTimer } from "./use-simple-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { usePlayerSelection } from "./use-player-selection";
import { useGameSession } from "./use-game-session";
import { useGameScore } from "./use-game-score";
import { useSimpleGameLogic } from "./use-simple-game-logic";
import { useSimpleGameState } from "./use-simple-game-state";
import { useSimpleGameMetrics } from "./use-simple-game-metrics";
import { useSimpleGameCallbacks } from "./use-simple-game-callbacks";

export const MAX_ATTEMPTS = 1;
export const TIME_LIMIT_SECONDS = 30;

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  console.log('🎮 useSimpleGuessGame hook inicializado:', {
    playersCount: players?.length || 0
  });

  // Game progress and difficulty
  const [gameProgress, setGameProgress] = useState<GameProgressInfo>({
    currentRound: 1,
    currentStreak: 0,
    allowedDifficulties: ['facil'],
    nextDifficultyThreshold: 5
  });
  
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('facil');

  // Composed hooks
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed, playerChangeCount } = usePlayerSelection(players);
  const { sessionId, registerGameStart, resetSession } = useGameSession();
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();
  
  // New modular hooks
  const {
    gameOver,
    hasLost,
    gameActive,
    gameKey,
    attempts,
    setGameOver,
    setHasLost,
    setGameActive,
    endGame,
    startGame,
    forceRefresh: forceRefreshState
  } = useSimpleGameState();

  const {
    startMetricsTracking,
    incrementAttempts,
    incrementCorrectGuesses,
    saveGameData,
    resetMetrics
  } = useSimpleGameMetrics();

  const {
    handleTimeUp,
    handleTabChange,
    handleCorrectGuess,
    handleIncorrectGuess,
    handleGameEnd
  } = useSimpleGameCallbacks({
    currentPlayer,
    gameActive,
    gameOver,
    score,
    endGame,
    resetStreak,
    saveGameData,
    setGameProgress,
    addScore,
    incrementCorrectGuesses,
    incrementAttempts
  });

  console.log('🔍 Estado atual do jogo:', {
    currentPlayerName: currentPlayer?.name || 'null',
    gameActive,
    gameOver,
    score,
    playerChangeCount
  });

  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useSimpleGameTimer(TIME_LIMIT_SECONDS);

  // Game logic hook with enhanced callbacks
  const { handleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: handleCorrectGuess,
    onIncorrectGuess: handleIncorrectGuess,
    onGameEnd: handleGameEnd,
    selectRandomPlayer,
    stopTimer
  });

  // Start game for player
  const startGameForPlayer = useCallback(async () => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando timer para:', currentPlayer.name);
      startGame();
      
      // Start game metrics tracking
      startMetricsTracking();
      
      // Register game start
      if (!sessionId) {
        await registerGameStart();
      }
      
      // Start timer
      setTimeout(() => {
        if (!isRunning) {
          startTimer();
        }
      }, 100);
    }
  }, [currentPlayer, gameOver, isRunning, startTimer, sessionId, registerGameStart, startGame, startMetricsTracking]);

  // Start game when player is selected
  useEffect(() => {
    if (currentPlayer && !gameActive && !gameOver) {
      console.log('🔄 Novo jogador detectado, iniciando jogo:', currentPlayer.name);
      startGameForPlayer();
    }
  }, [currentPlayer, gameActive, gameOver, startGameForPlayer]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refresh - selecionando novo jogador');
    forceRefreshState();
    selectRandomPlayer();
  }, [selectRandomPlayer, forceRefreshState]);

  // Reset score function
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetSession();
    setGameProgress({
      currentRound: 1,
      currentStreak: 0,
      allowedDifficulties: ['facil'],
      nextDifficultyThreshold: 5
    });
    
    // Reset game metrics
    resetMetrics();
  }, [resetAll, resetSession, setGameActive, resetMetrics]);

  return {
    currentPlayer,
    gameKey,
    gameProgress,
    currentDifficulty,
    attempts,
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
