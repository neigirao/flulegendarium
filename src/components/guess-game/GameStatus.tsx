
import { useState } from "react";
import { RankingForm } from "./RankingForm";

interface GameStatusProps {
  attempts: number;
  maxAttempts: number;
  score: number;
  gameOver: boolean;
  onNextPlayer: () => void;
}

export const GameStatus = ({ 
  attempts, 
  maxAttempts, 
  score,
  gameOver,
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

      <div className="text-sm text-gray-600">
        <p>Tentativas restantes: {maxAttempts - attempts}</p>
        <p>Dicas desbloqueadas: {attempts}/{maxAttempts}</p>
        <p className="font-medium">Pontuação: {score}</p>
      </div>
    </div>
  );
};
