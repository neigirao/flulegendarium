
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img 
            src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
            alt="Fluminense FC" 
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-4xl font-black text-flu-grena">
            Lendas do Flu
          </h1>
        </div>
        <p className="text-xl text-gray-600 font-medium">Adivinhe a Lenda Tricolor!</p>
        <p className="text-sm text-gray-500 mt-2">
          Use nomes oficiais ou apelidos conhecidos
        </p>
      </div>

      {currentPlayer && (
        <div className="space-y-8">
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
      
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button 
          onClick={toggleRanking}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            showRanking 
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
              : "bg-flu-grena text-white hover:bg-flu-grena/90 shadow-lg"
          }`}
        >
          {showRanking ? "Ocultar Ranking" : "Ver Ranking"}
        </button>
        
        {showRanking && (
          <div className="mt-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-flu-grena font-medium">Carregando ranking...</p>
                </div>
              </div>
            }>
              <LazyRankingDisplay />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};
