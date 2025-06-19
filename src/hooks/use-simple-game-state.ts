
import { useState, useCallback } from "react";

export const useSimpleGameState = () => {
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now());
  const [attempts, setAttempts] = useState<string[]>([]);

  const resetGameState = useCallback(() => {
    setGameOver(false);
    setHasLost(false);
    setGameActive(false);
    setAttempts([]);
  }, []);

  const endGame = useCallback((lost: boolean = true) => {
    setGameOver(true);
    setHasLost(lost);
    setGameActive(false);
  }, []);

  const startGame = useCallback(() => {
    setGameOver(false);
    setHasLost(false);
    setGameActive(true);
    setAttempts([]);
  }, []);

  const forceRefresh = useCallback(() => {
    setGameKey(Date.now());
  }, []);

  return {
    gameOver,
    hasLost,
    gameActive,
    gameKey,
    attempts,
    setGameOver,
    setHasLost,
    setGameActive,
    setAttempts,
    resetGameState,
    endGame,
    startGame,
    forceRefresh
  };
};
