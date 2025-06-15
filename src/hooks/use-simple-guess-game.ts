
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { useSimpleGameTimer, TIME_LIMIT_SECONDS } from "./use-simple-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { useEnhancedPlayerSelection } from "./use-enhanced-player-selection";
import { useGameSession } from "./use-game-session";
import { useGameScore } from "./use-game-score";
import { useSimpleGameLogic } from "./use-simple-game-logic";

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  
  // Estados básicos do jogo
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

  // Callback para quando o tempo acabar
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

  // Callback para mudança de aba
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
    }
  }, [gameActive, gameOver, resetStreak]);
  
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  const { timeRemaining, isRunning, startTimer, stopTimer, resetTimer } = useSimpleGameTimer(handleTimeUp);

  // Enhanced callbacks for game logic
  const handleCorrectGuess = useCallback((points: number) => {
    console.log('✅ Resposta correta! Pontos:', points, 'Player atual:', currentPlayer?.name);
    addScore(points);
    stopTimer();
  }, [addScore, stopTimer, currentPlayer]);

  const handleIncorrectGuess = useCallback(() => {
    console.log('❌ Resposta incorreta! Player:', currentPlayer?.name);
    setGameOver(true);
    setHasLost(true);
    setGameActive(false);
    resetStreak();
    stopTimer();
  }, [resetStreak, stopTimer, currentPlayer]);

  const handleNextPlayer = useCallback(() => {
    console.log('🔄 Indo para próximo jogador... Player atual:', currentPlayer?.name);
    // Delay to allow UI to update before changing player
    setTimeout(() => {
      selectRandomPlayer();
    }, 100);
  }, [selectRandomPlayer, currentPlayer]);

  const { handleGuess, isProcessing } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: handleCorrectGuess,
    onIncorrectGuess: handleIncorrectGuess,
    onNextPlayer: handleNextPlayer
  });

  // Start game with enhanced logging
  const startGameForPlayer = useCallback(async () => {
    if (currentPlayer && !gameOver) {
      console.log('🎮 Iniciando jogo para:', {
        name: currentPlayer.name,
        id: currentPlayer.id,
        gameKey,
        changeCount: playerChangeCount
      });
      
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      
      if (!sessionId) {
        await registerGameStart();
      }
      
      setTimeout(() => {
        resetTimer();
        startTimer();
      }, 500);
    }
  }, [currentPlayer, gameOver, sessionId, registerGameStart, resetTimer, startTimer, gameKey, playerChangeCount]);

  // Enhanced effect for game start
  useEffect(() => {
    if (currentPlayer) {
      console.log('🔄 Novo jogador detectado, iniciando jogo:', {
        name: currentPlayer.name,
        id: currentPlayer.id,
        gameKey,
        changeCount: playerChangeCount
      });
      startGameForPlayer();
    }
  }, [currentPlayer, gameKey, startGameForPlayer, playerChangeCount]);

  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetSession();
  }, [resetAll, resetSession]);

  return {
    // Estado do jogo
    currentPlayer,
    gameKey, // NEW: For forcing image refresh
    score,
    gameOver,
    hasLost,
    gameActive,
    
    // Timer
    timeRemaining,
    isTimerRunning: isRunning,
    TIME_LIMIT_SECONDS,
    
    // Estatísticas
    gamesPlayed,
    currentStreak,
    maxStreak,
    
    // Ações
    handleGuess,
    selectRandomPlayer,
    forceRefresh, // NEW: For manual refresh
    handlePlayerImageFixed,
    startGameForPlayer,
    resetScore,
    
    // Estados de carregamento
    isProcessingGuess: isProcessing,
    
    // Debug info
    playerChangeCount,
    
    // Constantes
    attempts: 0,
    MAX_ATTEMPTS: 1
  };
};
