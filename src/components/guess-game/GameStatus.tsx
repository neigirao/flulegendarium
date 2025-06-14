
import { useState, useEffect } from "react";
import { RankingForm } from "./RankingForm";
import { Timer, Trophy, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameStatusProps {
  attempts: number;
  maxAttempts: number;
  score: number;
  gameOver: boolean;
  timeRemaining: number;
  onNextPlayer: () => void;
}

export const GameStatus = ({ 
  attempts, 
  maxAttempts, 
  score,
  gameOver,
  timeRemaining,
  onNextPlayer
}: GameStatusProps) => {
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [prevTime, setPrevTime] = useState(timeRemaining);
  const { toast } = useToast();
  
  // Efeito para alertar quando o tempo estiver acabando
  useEffect(() => {
    if (timeRemaining === 10 && prevTime > 10 && !gameOver) {
      toast({
        variant: "destructive",
        title: "Atenção!",
        description: "Apenas 10 segundos restantes!",
      });
    }
    
    setPrevTime(timeRemaining);
  }, [timeRemaining, prevTime, gameOver, toast]);
  
  const handleShowRankingForm = () => {
    setShowRankingForm(true);
  };
  
  const handleNextPlayer = () => {
    setShowRankingForm(false);
    onNextPlayer();
  };

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {gameOver && !showRankingForm && (
        <div className="text-center mt-4 animate-fade-in">
          <button
            onClick={handleShowRankingForm}
            className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto flu-shadow"
          >
            <Trophy className="w-5 h-5" />
            Salvar Pontuação
          </button>
        </div>
      )}
      
      {gameOver && showRankingForm && (
        <RankingForm 
          score={score}
          onSaved={handleNextPlayer}
          onCancel={handleNextPlayer}
        />
      )}

      <div className="space-y-4 p-4 rounded-lg bg-white/90 shadow-sm border border-flu-verde/30">
        <div className="flex items-center justify-between">
          {/* Timer - agora visível */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-flu-verde" />
            <span className={`font-bold text-lg ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-flu-verde'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Informação de pontuação */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-lg">{score} pontos</span>
          </div>
        </div>

        {/* Aviso de tentativa única */}
        <div className="text-center">
          <div className="text-sm font-medium text-flu-grena flex items-center justify-center gap-1">
            <Timer className="w-4 h-4" />
            <span>Apenas uma tentativa!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
