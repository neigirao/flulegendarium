
import { useState, useEffect, useCallback } from "react";

interface UseGameStateProps {
  hasLost: boolean;
}

export const useGameState = ({ hasLost }: UseGameStateProps) => {
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAuthenticatedGame, setIsAuthenticatedGame] = useState(false);

  // Show game over dialog when player loses
  useEffect(() => {
    if (hasLost) {
      setShowGameOverDialog(true);
    }
  }, [hasLost]);

  // Handle dialog close and select a new player
  const handleGameOverClose = useCallback((selectRandomPlayer: () => void) => {
    setShowGameOverDialog(false);
    selectRandomPlayer();
  }, []);

  const handleTutorialComplete = useCallback((user: any) => {
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
  }, []);

  const handleSkipTutorial = useCallback((user: any) => {
    setShowTutorial(false);
    setGameStarted(true);
    setIsAuthenticatedGame(!!user);
  }, []);

  return {
    showGameOverDialog,
    setShowGameOverDialog,
    showTutorial,
    gameStarted,
    setGameStarted,
    isAuthenticatedGame,
    setIsAuthenticatedGame,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial
  };
};
