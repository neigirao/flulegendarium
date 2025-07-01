
import { useState, useCallback } from "react";

export const useDecadeGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  const MAX_ATTEMPTS = 3;

  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points);
    setCurrentStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
  }, []);

  const endGame = useCallback(() => {
    setGameOver(true);
    setGamesPlayed(prev => prev + 1);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setAttempts(0);
    setCurrentStreak(0);
    // Don't reset maxStreak and gamesPlayed as they persist across games
  }, []);

  const incrementAttempts = useCallback(() => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        endGame();
      }
      return newAttempts;
    });
  }, [endGame]);

  const resetStreak = useCallback(() => {
    setCurrentStreak(0);
  }, []);

  return {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    MAX_ATTEMPTS,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed
  };
};
