
import React from "react";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { Player } from "@/types/guess-game";

interface GameModalsProps {
  showTutorial: boolean;
  showGuestNameForm: boolean;
  showGameOverDialog: boolean;
  currentPlayer: Player | null;
  gameStarted: boolean;
  score: number;
  isAuthenticatedGame: boolean;
  guestPlayerName: string;
  onTutorialComplete: () => void;
  onSkipTutorial: () => void;
  handleGuestNameSubmitted: (name: string) => void;
  handleGuestNameCancel: () => void;
  handleGameOverClose: () => void;
  resetScore: () => void;
}

export const GameModals = ({
  showTutorial,
  showGuestNameForm,
  showGameOverDialog,
  currentPlayer,
  gameStarted,
  score,
  isAuthenticatedGame,
  guestPlayerName,
  onTutorialComplete,
  onSkipTutorial,
  handleGuestNameSubmitted,
  handleGuestNameCancel,
  handleGameOverClose,
  resetScore
}: GameModalsProps) => {
  return (
    <>
      {showTutorial && (
        <GameTutorial
          onComplete={onTutorialComplete}
          onSkip={onSkipTutorial}
        />
      )}

      {showGuestNameForm && (
        <GuestNameForm
          onNameSubmitted={handleGuestNameSubmitted}
          onCancel={handleGuestNameCancel}
        />
      )}

      {currentPlayer && gameStarted && (
        <GameOverDialog
          open={showGameOverDialog}
          onClose={handleGameOverClose}
          playerName={currentPlayer.name}
          score={score}
          onResetScore={resetScore}
          isAuthenticated={isAuthenticatedGame}
          guestPlayerName={guestPlayerName}
        />
      )}
    </>
  );
};
