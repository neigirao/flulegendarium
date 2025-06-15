
import { useState, useCallback } from "react";

export const useGameScore = () => {
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points);
    setCurrentStreak(prev => prev + 1);
    setGamesPlayed(prev => prev + 1);
  }, []);

  const resetStreak = useCallback(() => {
    setCurrentStreak(0);
  }, []);

  const resetAll = useCallback(() => {
    setScore(0);
    setCurrentStreak(0);
    setGamesPlayed(0);
  }, []);

  return {
    score,
    currentStreak,
    gamesPlayed,
    maxStreak: Math.max(currentStreak, 0),
    addScore,
    resetStreak,
    resetAll
  };
};
