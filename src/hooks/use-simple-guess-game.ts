
import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types/guess-game";
import { useGameTimer, TIME_LIMIT_SECONDS } from "./use-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { useEnhancedPlayerSelection } from "./use-enhanced-player-selection";
import { useGameSession } from "./use-game-session";
import { useGameScore } from "./use-game-score";
import { useGameLogic } from "./use-game-logic";
import { useAuth } from "./useAuth";
import { saveGameHistory } from "@/services/gameHistoryService";

export const MAX_ATTEMPTS = 1;

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
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

  // Game metrics for saving
  const gameStartTimeRef = useRef<number | null>(null);
  const totalAttemptsRef = useRef(0);
  const correctGuessesRef = useRef(0);

  // Start tracking game metrics when game starts
  const startGameMetrics = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
    console.log('🎯 Game metrics tracking started');
  }, []);

  // Save game history when game ends
  const saveGameData = useCallback(async (finalScore: number, isCorrect: boolean = false) => {
    if (!user?.id || !gameStartTimeRef.current) {
      console.log('⚠️ Cannot save game data - missing user or start time');
      return;
    }

    try {
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const attempts = totalAttemptsRef.current + (isCorrect ? 1 : 0);
      const correct = correctGuessesRef.current + (isCorrect ? 1 : 0);

      console.log('💾 Saving game history:', {
        userId: user.id,
        score: finalScore,
        correct_guesses: correct,
        total_attempts: attempts,
        game_duration: gameDuration
      });

      const savedHistory = await saveGameHistory({
        user_id: user.id,
        score: finalScore,
        correct_guesses: correct,
        total_attempts: attempts,
        game_duration: gameDuration
      });

      console.log('✅ Game history saved successfully:', savedHistory);
      
      toast({
        title: "Jogo salvo!",
        description: `Pontuação: ${finalScore} | Duração: ${gameDuration}s`,
      });

    } catch (error) {
      console.error('❌ Error saving game history:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o histórico do jogo.",
      });
    }
  }, [user, toast]);

  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      
      // Save game data when time runs out
      saveGameData(score, false);
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  }, [currentPlayer, gameOver, score, toast, gameActive, resetStreak, saveGameData]);

  // Handle tab change callback
  const handleTabChange = useCallback(() => {
    if (gameActive && !gameOver) {
      console.log('👁️ Tab change detected - ending game');
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      
      // Save game data when user switches tabs
      saveGameData(score, false);
    }
  }, [gameActive, gameOver, resetStreak, saveGameData, score]);
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useGameTimer(gameOver, handleTimeUp);

  // Game logic hook with enhanced callbacks
  const { handleGuess, isProcessingGuess } = useGameLogic({
    currentPlayer,
    gameOver,
    gameActive,
    onCorrectGuess: (points: number) => {
      console.log('✅ Resposta correta! Adicionando pontos:', points);
      correctGuessesRef.current += 1;
      totalAttemptsRef.current += 1;
      addScore(points);
      
      // Save game data for correct guess
      saveGameData(score + points, true);
    },
    onIncorrectGuess: () => {
      console.log('❌ Resposta incorreta');
      totalAttemptsRef.current += 1;
      resetStreak();
      
      // End game and save data for incorrect guess
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      saveGameData(score, false);
    },
    onGameEnd: () => {
      console.log('🏁 Game ended');
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
      
      // Start game metrics tracking
      startGameMetrics();
      
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
  }, [currentPlayer, gameOver, isRunning, startTimer, sessionId, registerGameStart, startGameMetrics]);

  // Reset score function
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetSession();
    
    // Reset game metrics
    gameStartTimeRef.current = null;
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
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
