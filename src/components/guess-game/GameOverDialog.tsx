
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
import { Trophy, RotateCcw, Play, Home, Instagram } from "lucide-react";
import { GameConfirmDialog } from "./GameConfirmDialog";
import { useGameConfirmations } from "@/hooks/use-game-confirmations";
import { RankingForm } from "./RankingForm";
import { QuickShareButton } from "../social/QuickShareButton";
import { Link } from "react-router-dom";

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
  onResetScore: () => void;
  isAuthenticated: boolean;
  guestPlayerName?: string; // NEW: Nome do jogador convidado
}

export const GameOverDialog = ({
  open,
  onClose,
  playerName,
  score,
  onResetScore,
  isAuthenticated,
  guestPlayerName
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

  // Para jogadores convidados, mostrar apenas pontuação e compartilhamento
  const isGuestPlayer = !isAuthenticated && guestPlayerName;
  const displayName = guestPlayerName || playerName;

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
              {isGuestPlayer ? (
                <>
                  Parabéns <strong className="text-flu-grena">{displayName}</strong>!
                  <br />
                  <span className="text-2xl font-bold text-flu-verde mt-2 block">
                    Você fez {score} pontos
                  </span>
                </>
              ) : (
                <>
                  O jogador era <strong className="text-flu-grena">{playerName}</strong>
                  <br />
                  <span className="text-2xl font-bold text-flu-verde mt-2 block">
                    Pontuação Final: {score} pontos
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isGuestPlayer ? (
              // Layout simplificado para jogadores convidados
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <QuickShareButton
                    score={score}
                    correctGuesses={Math.floor(score / 5)}
                    playerName={guestPlayerName}
                    gameMode="Convidado"
                    size="lg"
                    className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white"
                  />
                  
                  {/* Instagram Call-to-Action */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700 mb-3">
                      📸 <strong>Compartilhe seu resultado!</strong><br />
                      Nos marque no Instagram para aparecer em nossos stories
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      asChild
                    >
                      <a 
                        href="https://www.instagram.com/jogolendasdoflu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Seguir @jogolendasdoflu
                      </a>
                    </Button>
                  </div>
                </div>
                
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
                </DialogFooter>
              </div>
            ) : (
              // Layout original para usuários autenticados
              <>
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
              </>
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
