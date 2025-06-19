
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player, DifficultyChangeInfo } from "@/types/guess-game";
import { useSimpleGameTimer } from "./use-simple-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { useAdaptivePlayerSelection } from "./use-adaptive-player-selection";
import { useSimpleGameLogic } from "./use-simple-game-logic";
import { useGameScore } from "./use-game-score";

export const MAX_ATTEMPTS = 1;
export const TIME_LIMIT_SECONDS = 60;

export const useAdaptiveGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [playerChangeCount, setPlayerChangeCount] = useState(0);
  const [difficultyChangeInfo, setDifficultyChangeInfo] = useState<DifficultyChangeInfo | null>(null);

  // Adaptive player selection
  const {
    currentPlayer,
    currentDifficulty,
    gameProgress,
    selectRandomPlayer: selectRandomPlayerBase,
    handleCorrectGuess: handleCorrectGuessBase,
    handleIncorrectGuess: handleIncorrectGuessBase,
    resetDifficulty,
    availablePlayersCount
  } = useAdaptivePlayerSelection(players);

  // Game scoring with multiplier
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();

  // Calculate difficulty progress percentage
  const difficultyProgress = (currentStreak / gameProgress.nextDifficultyThreshold) * 100;

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      handleIncorrectGuessBase();
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, gameActive, handleIncorrectGuessBase]);

  // Game timer
  const { 
    timeRemaining, 
    isRunning: isTimerRunning, 
    startTimer, 
    stopTimer, 
    resetTimer 
  } = useSimpleGameTimer(TIME_LIMIT_SECONDS);

  // Enhanced player selection with difficulty progression
  const selectRandomPlayer = useCallback(() => {
    selectRandomPlayerBase();
    setPlayerChangeCount(prev => prev + 1);
    setGameKey(prev => prev + 1);
    resetTimer();
  }, [selectRandomPlayerBase, resetTimer]);

  // Handle tab change
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      handleIncorrectGuessBase();
    }
  }, [gameActive, gameOver, handleIncorrectGuessBase]);
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });

  // Game logic with adaptive scoring
  const { handleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: (basePoints: number) => {
      console.log('✅ Resposta correta! Pontos base:', basePoints);
      
      // Aplicar multiplicador de dificuldade
      const multipliedPoints = Math.round(basePoints * currentDifficulty.multiplier);
      console.log('✨ Pontos com multiplicador:', multipliedPoints, 'x', currentDifficulty.multiplier);
      
      addScore(multipliedPoints);
      
      // Check for difficulty change and create notification
      const oldLevel = currentDifficulty.level;
      handleCorrectGuessBase();
      
      // If difficulty changed, show notification
      if (currentDifficulty.level !== oldLevel) {
        setDifficultyChangeInfo({
          direction: 'up',
          newLevel: currentDifficulty.level,
          oldLevel,
          reason: `${currentStreak + 1} acertos consecutivos`
        });
      }
      
      // Continuar para próximo jogador automaticamente
      setTimeout(() => {
        selectRandomPlayer();
      }, 1500);
    },
    onIncorrectGuess: (guess: string) => {
      console.log('❌ Resposta incorreta:', guess);
      
      // Check for difficulty change and create notification
      const oldLevel = currentDifficulty.level;
      handleIncorrectGuessBase();
      
      // If difficulty changed, show notification
      if (currentDifficulty.level !== oldLevel) {
        setDifficultyChangeInfo({
          direction: 'down',
          newLevel: currentDifficulty.level,
          oldLevel,
          reason: 'Erro na resposta'
        });
      }
      
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
    },
    onGameEnd: () => {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
    },
    selectRandomPlayer,
    stopTimer
  });

  // Start game for player
  const startGameForPlayer = useCallback(() => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando timer para:', currentPlayer.name, 'Dificuldade:', currentDifficulty.label);
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      
      setTimeout(() => {
        if (!isTimerRunning) {
          startTimer();
        }
      }, 100);
    }
  }, [currentPlayer, gameOver, isTimerRunning, startTimer, currentDifficulty]);

  // Force refresh
  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refresh adaptativo');
    setGameKey(prev => prev + 1);
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  // Handle player image fixed
  const handlePlayerImageFixed = useCallback((imageUrl?: string) => {
    console.log('🖼️ Imagem do jogador carregada, iniciando jogo');
    if (!gameActive && !gameOver) {
      startGameForPlayer();
    }
  }, [gameActive, gameOver, startGameForPlayer]);

  // Clear difficulty change notification
  const clearDifficultyChange = useCallback(() => {
    setDifficultyChangeInfo(null);
  }, []);

  // Reset score
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação e dificuldade');
    resetAll();
    resetDifficulty();
    setGameActive(false);
    setDifficultyChangeInfo(null);
  }, [resetAll, resetDifficulty]);

  return {
    // Player and game state
    currentPlayer,
    currentDifficulty: currentDifficulty.level,
    gameProgress,
    gameKey,
    playerChangeCount,
    availablePlayersCount,
    difficultyProgress,
    difficultyChangeInfo,
    
    // Game mechanics
    attempts: [],
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    TIME_LIMIT_SECONDS,
    
    // Game actions
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    startGameForPlayer,
    forceRefresh,
    resetScore,
    clearDifficultyChange,
    
    // Game status
    isProcessingGuess,
    hasLost,
    isTimerRunning,
    gamesPlayed,
    currentStreak,
    maxStreak
  };
};
