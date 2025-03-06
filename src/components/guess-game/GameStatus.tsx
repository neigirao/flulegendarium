
import { useState } from "react";
import { RankingForm } from "./RankingForm";

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

  return (
    <div className="space-y-4">
      {gameOver && !showRankingForm && (
        <div className="text-center mt-4">
          <button
            onClick={handleShowRankingForm}
            className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
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

      <div className="text-sm text-gray-600 space-y-1">
        <div className={`font-medium ${timeRemaining < 10 && !gameOver ? 'text-red-500 animate-pulse' : ''}`}>
          Tempo: {formatTime(timeRemaining)}
        </div>
        {/* Updated to show that only one attempt is allowed */}
        <p className="font-medium text-red-600">Atenção: Apenas uma tentativa!</p>
        <p className="font-medium">Pontuação: {score}</p>
      </div>
    </div>
  );
};
