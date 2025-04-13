
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RankingForm } from "@/components/guess-game/RankingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
}

export const GameOverDialog = ({ open, onClose, playerName, score }: GameOverDialogProps) => {
  const [showRankingForm, setShowRankingForm] = useState(true);
  
  const handleRankingSaved = () => {
    setShowRankingForm(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-center text-2xl font-bold text-flu-grena">
          Game Over!
        </DialogTitle>
        
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
                <p className="text-center text-gray-600">
                  Pontuação salva com sucesso!
                </p>
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
