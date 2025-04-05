
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
  imageLoaded?: boolean;
}

export const GameStatus = ({ 
  attempts, 
  maxAttempts, 
  score,
  gameOver,
  timeRemaining,
  onNextPlayer,
  imageLoaded = true
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcula a porcentagem de tempo restante (para a barra de progresso)
  const timePercentage = (timeRemaining / 60) * 100;

  // Determina a cor da barra de tempo com base no tempo restante
  const getTimeBarColor = () => {
    if (timeRemaining > 30) return 'bg-flu-verde';
    if (timeRemaining > 10) return 'bg-yellow-500';
    return 'bg-flu-grena';
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
        {/* Barra de progresso do tempo */}
        {!gameOver && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-flu-grena" />
                <span className={`font-medium ${timeRemaining < 10 ? 'text-flu-grena' : 'text-flu-verde'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {!imageLoaded ? 'Carregando imagem...' : 
                  timeRemaining < 10 ? 'Tempo acabando!' : 'Tempo restante'}
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${getTimeBarColor()} ${timeRemaining < 10 ? 'animate-pulse' : ''}`}
                style={{ width: `${imageLoaded ? timePercentage : 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* Informação de pontuação */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-lg">{score}</span>
          </div>

          {/* Aviso de tentativa única */}
          <div className="text-sm font-medium text-flu-grena flex items-center gap-1">
            <Timer className="w-4 h-4" />
            <span>Apenas uma tentativa!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
