
import { useState, useCallback } from "react";
import { GameProgressInfo, DifficultyLevelType } from "@/types/guess-game";

export const useGameProgress = () => {
  const [gameProgress, setGameProgress] = useState<GameProgressInfo>({
    currentRound: 1,
    currentStreak: 0,
    allowedDifficulties: ['facil'],
    nextDifficultyThreshold: 5
  });
  
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelType>('facil');

  const updateGameProgress = useCallback((updates: Partial<GameProgressInfo>) => {
    setGameProgress(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const resetGameProgress = useCallback(() => {
    setGameProgress({
      currentRound: 1,
      currentStreak: 0,
      allowedDifficulties: ['facil'],
      nextDifficultyThreshold: 5
    });
    setCurrentDifficulty('facil');
  }, []);

  return {
    gameProgress,
    currentDifficulty,
    setCurrentDifficulty,
    updateGameProgress,
    resetGameProgress
  };
};
