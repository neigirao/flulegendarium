
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, RotateCcw, Play, Home } from "lucide-react";
import { GameConfirmDialog } from "./GameConfirmDialog";
import { useGameConfirmations } from "@/hooks/use-game-confirmations";
import { Link } from "react-router-dom";

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
  onResetScore: () => void;
  isAuthenticated: boolean;
}

export const GameOverDialog = ({
  open,
  onClose,
  playerName,
  score,
  onResetScore,
  isAuthenticated
}: GameOverDialogProps) => {
  const { confirmation, hideConfirmation, confirmResetScore, confirmExitGame } = useGameConfirmations();

  const handleResetScore = () => {
    confirmResetScore(() => {
      onResetScore();
      onClose();
    });
  };

  const handleExitToHome = () => {
    confirmExitGame(() => {
      window.location.href = '/';
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-flu-grena">
              <Trophy className="w-6 h-6" />
              Game Over
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              O jogador era <strong className="text-flu-grena">{playerName}</strong>
              <br />
              <span className="text-2xl font-bold text-flu-verde mt-2 block">
                Pontuação Final: {score} pontos
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={onClose}
              className="bg-flu-verde hover:bg-flu-verde/90 text-white flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Continuar Jogando
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResetScore}
                className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Resetar Pontuação
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExitToHome}
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Sair
              </Button>
            </div>
            
            {isAuthenticated && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Sua pontuação será salva automaticamente
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GameConfirmDialog
        open={confirmation.open}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
      />
    </>
  );
};
