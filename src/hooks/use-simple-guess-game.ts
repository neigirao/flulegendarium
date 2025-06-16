
import { useState, useEffect, useCallback } from 'react';

interface Player {
  id: string;
  name: string;
  image_url: string;
}

interface GuessAttempt {
  guess: string;
  isCorrect: boolean;
  timestamp: string;
  playerName: string;
  timeToGuess: number;
}

import { useObservability } from "./use-observability";
import { useGameMetrics } from "./use-game-metrics";

export const useSimpleGuessGame = (players: Player[] = []) => {
  const { trackError, log } = useObservability();
  const { 
    trackGameStart, 
    trackGameEnd, 
    trackPlayerGuess, 
    trackGameAbandonment 
  } = useGameMetrics();

  const MAX_ATTEMPTS = 3;
  const TIME_LIMIT_SECONDS = 20;

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [attempts, setAttempts] = useState<GuessAttempt[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [playerChangeCount, setPlayerChangeCount] = useState(0);
  const [playerChangeTime, setPlayerChangeTime] = useState<number | null>(null);

  // Utility functions defined first
  const normalizeText = useCallback((text: string): string => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }, []);

  const calculatePoints = useCallback((attempts: number, timeRemaining: number): number => {
    const basePoints = 100;
    const attemptMultiplier = Math.max(0, MAX_ATTEMPTS - attempts);
    const timeBonus = timeRemaining / TIME_LIMIT_SECONDS;
    const totalPoints = basePoints * attemptMultiplier * (1 + timeBonus);
    return Math.round(totalPoints);
  }, [MAX_ATTEMPTS, TIME_LIMIT_SECONDS]);

  // Enhanced error handling with observability
  const handleError = useCallback((error: Error, context: string) => {
    trackError(error, {
      severity: 'high',
      component: 'SimpleGuessGame',
      action: context
    });
  }, [trackError]);

  // Enhanced player selection with error handling
  const selectRandomPlayer = useCallback(() => {
    try {
      if (!players || players.length === 0) {
        const error = new Error('No players available for selection');
        handleError(error, 'selectRandomPlayer');
        return;
      }

      let newPlayer: Player;
      let attempts = 0;
      do {
        newPlayer = players[Math.floor(Math.random() * players.length)];
        attempts++;
        if (attempts > players.length * 2) {
          const error = new Error('Failed to select a different player after multiple attempts');
          handleError(error, 'selectRandomPlayer');
          return;
        }
      } while (newPlayer.id === currentPlayer?.id);

      setCurrentPlayer(newPlayer);
      setAttempts([]);
      setTimeRemaining(TIME_LIMIT_SECONDS);
      setGameOver(false);
      setHasLost(false);
      setGameKey(prevKey => prevKey + 1);
      setIsTimerRunning(true);
      setPlayerChangeCount(prevCount => prevCount + 1);
      setPlayerChangeTime(Date.now());
      
      log('info', 'Player selected', { 
        playerId: newPlayer.id, 
        playerName: newPlayer.name,
        changeCount: playerChangeCount + 1
      });

    } catch (error) {
      handleError(error as Error, 'selectRandomPlayer');
    }
  }, [players, currentPlayer, handleError, log, playerChangeCount]);

  // Track game session start
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      trackGameStart({
        sessionId,
        startTime: Date.now(),
        isAuthenticated: false // This will be updated based on auth state
      });
      
      log('info', 'Game session initialized', { 
        playerId: currentPlayer.id, 
        playerName: currentPlayer.name 
      });
    }
  }, [currentPlayer, gameOver, trackGameStart, log]);

  // Enhanced guess handling with metrics
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || gameOver || isProcessingGuess) {
      log('warn', 'Invalid guess attempt', { 
        hasPlayer: !!currentPlayer, 
        gameOver, 
        isProcessing: isProcessingGuess 
      });
      return false;
    }

    const guessStartTime = Date.now();
    setIsProcessingGuess(true);

    try {
      const isCorrect = normalizeText(guess) === normalizeText(currentPlayer.name);
      const timeToGuess = guessStartTime - (playerChangeTime || guessStartTime);
      
      // Track the guess with metrics
      trackPlayerGuess(currentPlayer.name, guess, isCorrect, timeToGuess);
      
      const newAttempt: GuessAttempt = {
        guess: guess.trim(),
        isCorrect,
        timestamp: new Date().toISOString(),
        playerName: currentPlayer.name,
        timeToGuess
      };

      setAttempts(prev => [...prev, newAttempt]);

      if (isCorrect) {
        const points = calculatePoints(attempts.length, timeRemaining);
        setScore(prev => prev + points);
        setCurrentStreak(prev => prev + 1);
        setMaxStreak(prev => Math.max(prev, currentStreak + 1));
        
        log('info', 'Correct guess!', { 
          playerName: currentPlayer.name, 
          points, 
          timeToGuess 
        });

        // Auto advance after correct guess
        setTimeout(() => {
          selectRandomPlayer();
        }, 1500);

        return true;
      } else {
        log('info', 'Incorrect guess', { 
          playerName: currentPlayer.name, 
          guess, 
          timeToGuess 
        });

        if (attempts.length + 1 >= MAX_ATTEMPTS) {
          setGameOver(true);
          setHasLost(true);
          setCurrentStreak(0);
          
          log('warn', 'Game over - max attempts reached', { 
            finalScore: score,
            totalAttempts: attempts.length + 1 
          });
        }
        return false;
      }
    } catch (error) {
      handleError(error as Error, 'handleGuess');
      return false;
    } finally {
      setIsProcessingGuess(false);
    }
  }, [
    currentPlayer, gameOver, isProcessingGuess, attempts, timeRemaining,
    score, currentStreak, MAX_ATTEMPTS, normalizeText, calculatePoints,
    trackPlayerGuess, log, handleError, selectRandomPlayer, playerChangeTime
  ]);

  const startGameForPlayer = useCallback(() => {
    if (players && players.length > 0) {
      selectRandomPlayer();
      setIsTimerRunning(true);
      setGamesPlayed(prev => prev + 1);
    }
  }, [players, selectRandomPlayer]);

  const resetScore = useCallback(() => {
    setScore(0);
    setGamesPlayed(0);
    setCurrentStreak(0);
    setMaxStreak(0);
  }, []);

  const forceRefresh = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);

  const handlePlayerImageFixed = useCallback(() => {
    log('info', 'Player image loaded successfully', { 
      playerId: currentPlayer?.id, 
      playerName: currentPlayer?.name 
    });
  }, [currentPlayer, log]);

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTimerRunning && timeRemaining > 0 && !gameOver) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !gameOver) {
      setGameOver(true);
      setHasLost(true);
      setIsTimerRunning(false);
      setCurrentStreak(0);
      
      log('warn', 'Game over - time ran out', { 
        finalScore: score, 
        totalAttempts: attempts.length 
      });
    }

    return () => clearInterval(intervalId);
  }, [isTimerRunning, timeRemaining, gameOver, score, attempts.length, log]);

  return {
    currentPlayer,
    gameKey,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    TIME_LIMIT_SECONDS,
    handleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    playerChangeCount,
    playerChangeTime
  };
};
