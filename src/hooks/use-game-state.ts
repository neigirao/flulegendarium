
import { useState, useEffect, useCallback } from "react";

interface UseGameStateProps {
  hasLost: boolean;
}

export const useGameState = ({ hasLost }: UseGameStateProps) => {
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAuthenticatedGame, setIsAuthenticatedGame] = useState(false);
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [guestPlayerName, setGuestPlayerName] = useState<string>("");

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
    if (user) {
      setGameStarted(true);
      setIsAuthenticatedGame(true);
    } else {
      // Para convidados, mostrar formulário de nome
      setShowGuestNameForm(true);
    }
  }, []);

  const handleSkipTutorial = useCallback((user: any) => {
    setShowTutorial(false);
    if (user) {
      setGameStarted(true);
      setIsAuthenticatedGame(true);
    } else {
      // Para convidados, mostrar formulário de nome
      setShowGuestNameForm(true);
    }
  }, []);

  const handleGuestNameSubmitted = useCallback((name: string) => {
    setGuestPlayerName(name);
    setShowGuestNameForm(false);
    setGameStarted(true);
    setIsAuthenticatedGame(false);
  }, []);

  const handleGuestNameCancel = useCallback(() => {
    setShowGuestNameForm(false);
    setShowTutorial(true);
  }, []);

  return {
    showGameOverDialog,
    setShowGameOverDialog,
    showTutorial,
    gameStarted,
    setGameStarted,
    isAuthenticatedGame,
    setIsAuthenticatedGame,
    showGuestNameForm,
    guestPlayerName,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial,
    handleGuestNameSubmitted,
    handleGuestNameCancel
  };
};
