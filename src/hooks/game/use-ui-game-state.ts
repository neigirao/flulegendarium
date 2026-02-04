import { useState, useCallback, useEffect } from "react";
import { User } from "@supabase/supabase-js";

/**
 * Estado de UI do jogo (dialogs, tutoriais, formulários)
 */
export interface UIGameState {
  // Game Over Dialog
  showGameOverDialog: boolean;
  setShowGameOverDialog: (show: boolean) => void;
  handleGameOverClose: (selectRandomPlayer: () => void) => void;
  
  // Tutorial
  showTutorial: boolean;
  handleTutorialComplete: (user: User | null) => void;
  handleSkipTutorial: (user: User | null) => void;
  
  // Game Status
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  
  // Auth Status
  isAuthenticatedGame: boolean;
  setIsAuthenticatedGame: (authenticated: boolean) => void;
  
  // Guest Name Form
  showGuestNameForm: boolean;
  guestPlayerName: string;
  handleGuestNameSubmitted: (name: string) => void;
  handleGuestNameCancel: () => void;
}

interface UseUIGameStateProps {
  /** Se o jogador perdeu o jogo */
  hasLost: boolean;
}

/**
 * Hook para gerenciar estado de UI do jogo.
 * 
 * Controla dialogs, tutoriais, formulários e transições de UI,
 * separando a lógica de apresentação da lógica de negócio do jogo.
 * 
 * @param {UseUIGameStateProps} props - Propriedades do hook
 * @returns {UIGameState} Estado e ações de UI
 * 
 * @example
 * ```tsx
 * const uiState = useUIGameState({ hasLost: gameOver });
 * 
 * if (uiState.showTutorial) {
 *   return <Tutorial onComplete={uiState.handleTutorialComplete} />;
 * }
 * 
 * if (uiState.showGuestNameForm) {
 *   return <GuestForm onSubmit={uiState.handleGuestNameSubmitted} />;
 * }
 * ```
 */
export const useUIGameState = ({ hasLost }: UseUIGameStateProps): UIGameState => {
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
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

  const handleGameOverClose = useCallback((selectRandomPlayer: () => void) => {
    setShowGameOverDialog(false);
    selectRandomPlayer();
  }, []);

  const handleTutorialComplete = useCallback((user: User | null) => {
    setShowTutorial(false);
    if (user) {
      setGameStarted(true);
      setIsAuthenticatedGame(true);
    } else {
      // Para convidados, mostrar formulário de nome
      setShowGuestNameForm(true);
    }
  }, []);

  const handleSkipTutorial = useCallback((user: User | null) => {
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
    handleGuestNameCancel,
  };
};
