
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Player, GameProgressInfo, DifficultyLevel } from "@/types/guess-game";
import { useSimpleGameTimer } from "./use-simple-game-timer";
import { useTabVisibility } from "./use-tab-visibility";
import { usePlayerSelection } from "./use-player-selection";
import { useSimpleGameSession } from "./use-simple-game-session";
import { useGameScore } from "./use-game-score";
import { useSimpleGameLogic } from "./use-simple-game-logic";
import { useAuth } from "./useAuth";
import { saveGameHistory } from "@/services/gameHistoryService";

export const MAX_ATTEMPTS = 1;
export const TIME_LIMIT_SECONDS = 30;

export const useSimpleGuessGame = (players: Player[] | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  console.log('🎮 useSimpleGuessGame hook inicializado:', {
    playersCount: players?.length || 0,
    hasUser: !!user
  });

  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now());
  const [attempts, setAttempts] = useState<string[]>([]);

  // Game progress and difficulty
  const [gameProgress, setGameProgress] = useState<GameProgressInfo>({
    level: 1,
    questionsInLevel: 0,
    questionsToNextLevel: 5,
    totalQuestions: 0
  });
  
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('facil');

  // Composed hooks
  const { currentPlayer, selectRandomPlayer, handlePlayerImageFixed, playerChangeCount } = usePlayerSelection(players);
  const { sessionId, registerGameStart, resetSession } = useSimpleGameSession();
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();

  console.log('🔍 Estado atual do jogo:', {
    currentPlayerName: currentPlayer?.name || 'null',
    gameActive,
    gameOver,
    score,
    playerChangeCount
  });

  // Game metrics for saving
  const gameStartTimeRef = useRef<number | null>(null);
  const totalAttemptsRef = useRef(0);
  const correctGuessesRef = useRef(0);

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

      await saveGameHistory({
        user_id: user.id,
        score: finalScore,
        correct_guesses: correct,
        total_attempts: attempts,
        game_duration: gameDuration
      });

    } catch (error) {
      console.error('❌ Error saving game history:', error);
    }
  }, [user]);

  // Handle time up callback
  const handleTimeUp = useCallback(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      
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
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      saveGameData(score, false);
    }
  }, [gameActive, gameOver, resetStreak, saveGameData, score]);
  
  // Tab visibility hook
  useTabVisibility({ 
    onTabChange: handleTabChange, 
    isGameActive: gameActive 
  });
  
  // Game timer hook
  const { timeRemaining, isRunning, startTimer, stopTimer } = useSimpleGameTimer(gameOver, handleTimeUp);

  // Game logic hook with enhanced callbacks
  const { handleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    gameOver,
    gameActive,
    onCorrectGuess: (points: number) => {
      console.log('✅ Resposta correta! Adicionando pontos:', points);
      correctGuessesRef.current += 1;
      totalAttemptsRef.current += 1;
      addScore(points);
      
      // Update game progress
      setGameProgress(prev => ({
        ...prev,
        questionsInLevel: prev.questionsInLevel + 1,
        totalQuestions: prev.totalQuestions + 1
      }));
      
      saveGameData(score + points, true);
    },
    onIncorrectGuess: () => {
      console.log('❌ Resposta incorreta');
      totalAttemptsRef.current += 1;
      resetStreak();
      
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      saveGameData(score, false);
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
      setAttempts([]);
      
      // Start game metrics tracking
      gameStartTimeRef.current = Date.now();
      totalAttemptsRef.current = 0;
      correctGuessesRef.current = 0;
      
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
  }, [currentPlayer, gameOver, isRunning, startTimer, sessionId, registerGameStart]);

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
    setGameKey(Date.now());
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  // Reset score function
  const resetScore = useCallback(() => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetSession();
    setGameProgress({
      level: 1,
      questionsInLevel: 0,
      questionsToNextLevel: 5,
      totalQuestions: 0
    });
    
    // Reset game metrics
    gameStartTimeRef.current = null;
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
  }, [resetAll, resetSession]);

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
