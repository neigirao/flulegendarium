
import { useState, Suspense, lazy } from "react";
import { PlayerImage } from "@/components/guess-game/PlayerImage";
import { GuessForm } from "@/components/guess-game/GuessForm";
import { GameStatus } from "@/components/guess-game/GameStatus";
import { Player } from "@/types/guess-game";

const LazyRankingDisplay = lazy(() => 
  import("@/components/guess-game/RankingDisplay").then(module => ({
    default: module.RankingDisplay
  }))
);

interface GameContainerProps {
  currentPlayer: Player | null;
  attempts: number;
  score: number;
  gameOver: boolean;
  timeRemaining: number;
  MAX_ATTEMPTS: number;
  handleGuess: (guess: string) => void;
  selectRandomPlayer: () => void;
  handlePlayerImageFixed: () => void;
  isProcessingGuess: boolean;
  hasLost: boolean;
}

export const GameContainer = ({
  currentPlayer,
  attempts,
  score,
  gameOver,
  timeRemaining,
  MAX_ATTEMPTS,
  handleGuess,
  selectRandomPlayer,
  handlePlayerImageFixed,
  isProcessingGuess,
  hasLost
}: GameContainerProps) => {
  const [showRanking, setShowRanking] = useState(false);

  const toggleRanking = () => {
    setShowRanking(prev => !prev);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-flu-grena mb-2">
          Lendas do Flu
        </h1>
        <p className="text-gray-600">Adivinhe a Lenda Tricolor!</p>
        <p className="text-sm text-gray-500 mt-2">
          Use nomes oficiais ou apelidos conhecidos
        </p>
      </div>

      {currentPlayer && (
        <div className="space-y-6">
          <PlayerImage 
            player={currentPlayer} 
            onImageFixed={handlePlayerImageFixed} 
          />

          {!hasLost && (
            <GuessForm 
              disabled={gameOver}
              onSubmitGuess={handleGuess}
              isProcessing={isProcessingGuess}
            />
          )}

          <GameStatus
            attempts={attempts}
            maxAttempts={MAX_ATTEMPTS}
            score={score}
            gameOver={gameOver}
            timeRemaining={timeRemaining}
            onNextPlayer={selectRandomPlayer}
          />
        </div>
      )}
      
      <div className="mt-6">
        <button 
          onClick={toggleRanking}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            showRanking 
              ? "bg-gray-200 text-gray-700" 
              : "bg-flu-grena text-white"
          }`}
        >
          {showRanking ? "Ocultar Ranking" : "Mostrar Ranking"}
        </button>
        
        {showRanking && (
          <Suspense fallback={<div className="w-full flex justify-center my-8">
            <div className="w-10 h-10 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
          </div>}>
            <LazyRankingDisplay />
          </Suspense>
        )}
      </div>
    </div>
  );
};
