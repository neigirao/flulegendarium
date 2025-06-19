
import { useState, useCallback } from "react";

export const useGameStateManagement = () => {
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now());
  const [attempts, setAttempts] = useState<string[]>([]);

  const startGame = useCallback(() => {
    setGameOver(false);
    setHasLost(false);
    setGameActive(true);
    setAttempts([]);
  }, []);

  const endGame = useCallback((lost: boolean = false) => {
    setGameOver(true);
    setHasLost(lost);
    setGameActive(false);
  }, []);

  const refreshGame = useCallback(() => {
    setGameKey(Date.now());
  }, []);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setHasLost(false);
    setGameActive(false);
    setAttempts([]);
    setGameKey(Date.now());
  }, []);

  return {
    gameOver,
    hasLost,
    gameActive,
    gameKey,
    attempts,
    startGame,
    endGame,
    refreshGame,
    resetGame
  };
};
