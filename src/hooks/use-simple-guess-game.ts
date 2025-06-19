
import { useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { useSimpleGameTimer } from "./use-simple-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { usePlayerSelection } from "./use-player-selection";
import { useGameSession } from "./use-game-session";
import { useGameScore } from "./use-game-score";
import { useGameMetrics } from "./game/use-game-metrics";
import { useGameProgress } from "./game/use-game-progress";
import { useGameStateManagement } from "./game/use-game-state-management";
import { useGameCallbacks } from "./game/use-game-callbacks";
import { useEnhancedGameLogic } from "./game/use-enhanced-game-logic";

export const MAX_ATTEMPTS = 1;
export const TIME_LIMIT_SECONDS = 30;

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  console.log('🎮 useSimpleGuessGame hook inicializado:', {
    playersCount: players?.length || 0
  });

  // Composed hooks
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed, playerChangeCount } = usePlayerSelection(players);
  const { sessionId, registerGameStart, resetSession } = useGameSession();
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();
  
  // New modular hooks
  const { saveGameData, startGameMetrics, incrementCorrectGuesses, incrementTotalAttempts, resetMetrics } = useGameMetrics();
  const { gameProgress, currentDifficulty, updateGameProgress, resetGameProgress } = useGameProgress();
  const { gameOver, hasLost, gameActive, gameKey, attempts, startGame, endGame, refreshGame, resetGame } = useGameStateManagement();

  // Game callbacks
  const { handleTimeUp, handleTabChange } = useGameCallbacks({
    gameActive,
    gameOver,
    currentPlayer,
    score,
    endGame,
    resetStreak,
    saveGameData
  });
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useSimpleGameTimer(handleTimeUp);

  // Enhanced game logic hook
  const { handleGuess, isProcessing } = useEnhancedGameLogic({
    currentPlayer,
    gameProgress,
    updateGameProgress,
    addScore,
    resetStreak,
    endGame,
    saveGameData,
    incrementCorrectGuesses,
    incrementTotalAttempts,
    selectRandomPlayer,
    score
  });

  // Start timer when a new player is selected and game is not over
  const startGameForPlayer = useCallback(async () => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando timer para:', currentPlayer.name);
      startGame();
      
      // Start game metrics tracking
      startGameMetrics();
      
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
  }, [currentPlayer, gameOver, isRunning, startTimer, sessionId, registerGameStart, startGame, startGameMetrics]);

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
    refreshGame();
    selectRandomPlayer();
  }, [selectRandomPlayer, refreshGame]);

  // Reset score function
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    resetGame();
    resetSession();
    resetGameProgress();
    resetMetrics();
  }, [resetAll, resetSession, resetGameProgress, resetMetrics, resetGame]);

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
    isProcessingGuess: isProcessing,
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
