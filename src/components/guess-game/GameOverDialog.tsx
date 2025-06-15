
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
import { RankingForm } from "./RankingForm";
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
  const [showRankingForm, setShowRankingForm] = useState(true);

  const handleNewGame = () => {
    onResetScore();
    onClose();
  };

  const handleExitToHome = () => {
    window.location.href = '/';
  };

  const handleRankingSaved = () => {
    // After saving ranking, go to home
    window.location.href = '/';
  };

  const handleSkipRanking = () => {
    // Skip ranking and go to home
    window.location.href = '/';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
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
          
          <div className="py-4">
            {showRankingForm ? (
              <RankingForm 
                score={score}
                onSaved={handleRankingSaved}
                onCancel={handleSkipRanking}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <DialogFooter className="flex flex-col gap-3 sm:flex-col">
                <Button
                  onClick={handleNewGame}
                  className="bg-flu-verde hover:bg-flu-verde/90 text-white flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Novo Jogo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExitToHome}
                  className="border-flu-grena text-flu-grena hover:bg-flu-grena/10 flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Voltar ao Início
                </Button>
                
                {isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Sua pontuação será salva automaticamente
                  </p>
                )}
              </DialogFooter>
            )}
          </div>
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
