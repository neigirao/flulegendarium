
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { RankingForm } from "@/components/guess-game/RankingForm";
import { RankingDisplay } from "@/components/guess-game/RankingDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
  onResetScore: () => void; // New prop for resetting score
}

export const GameOverDialog = ({ 
  open, 
  onClose, 
  playerName, 
  score,
  onResetScore 
}: GameOverDialogProps) => {
  const [showRankingForm, setShowRankingForm] = useState(true);
  const navigate = useNavigate();
  
  const handleRankingSaved = () => {
    setShowRankingForm(false);
    onResetScore(); // Reset score after saving
  };

  const handleDialogClose = () => {
    if (showRankingForm) {
      // If user hasn't saved their score, redirect to home and reset score
      onResetScore();
      navigate("/");
    } else {
      // If user has saved their score, just close the dialog
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleDialogClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-center text-2xl font-bold text-flu-grena">
          Game Over!
        </DialogTitle>
        
        {/* Custom close button that calls handleDialogClose */}
        <button 
          onClick={handleDialogClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <Card className="border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-800">
              O jogador era <span className="font-bold text-flu-grena">{playerName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center items-center gap-2">
              <Trophy className="h-6 w-6 text-flu-grena" />
              <p className="text-lg font-semibold">
                Sua pontuação: <span className="text-flu-grena">{score}</span>
              </p>
            </div>
            
            {showRankingForm ? (
              <RankingForm 
                score={score}
                onSaved={handleRankingSaved}
                onCancel={onClose}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-4">
                  Pontuação salva com sucesso!
                </p>
                
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
                  <RankingDisplay />
                </div>
                
                <button
                  onClick={onClose}
                  className="w-full bg-flu-grena text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Jogar novamente
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
