
import { useState, Suspense, lazy, useEffect } from "react";
import { PlayerImage } from "@/components/guess-game/PlayerImage";
import { GuessForm } from "@/components/guess-game/GuessForm";
import { GameStatus } from "@/components/guess-game/GameStatus";
import { Player } from "@/types/guess-game";
import { Clock } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

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
  startGameForPlayer: () => void;
  isTimerRunning: boolean;
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
  hasLost,
  startGameForPlayer,
  isTimerRunning
}: GameContainerProps) => {
  const [showRanking, setShowRanking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { trackEvent } = useAnalytics();

  // Start game when image is loaded and player is ready
  useEffect(() => {
    if (currentPlayer && imageLoaded && !isTimerRunning && !gameOver) {
      console.log('🎮 Imagem carregada, iniciando jogo para:', currentPlayer.name);
      startGameForPlayer();
    }
  }, [currentPlayer, imageLoaded, isTimerRunning, gameOver, startGameForPlayer]);

  // Reset image loaded state when player changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentPlayer?.id]);

  const handleImageLoaded = () => {
    console.log('🖼️ Imagem carregada para:', currentPlayer?.name);
    setImageLoaded(true);
  };

  const toggleRanking = () => {
    const newShowRanking = !showRanking;
    setShowRanking(newShowRanking);
    
    trackEvent({
      action: newShowRanking ? 'ranking_opened' : 'ranking_closed',
      category: 'UI',
      label: 'ranking_toggle'
    });
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
        <div className="space-y-6">
          {/* Timer acima da imagem */}
          {!gameOver && isTimerRunning && (
            <div className="bg-white/90 rounded-lg p-4 shadow-sm border border-flu-verde/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-flu-grena" />
                    <span className={`font-medium ${timeRemaining < 10 ? 'text-flu-grena' : 'text-flu-verde'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {timeRemaining < 10 ? 'Tempo acabando!' : 'Tempo restante'}
                  </div>
                </div>
                
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getTimeBarColor()} ${timeRemaining < 10 ? 'animate-pulse' : ''}`}
                    style={{ width: `${timePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <PlayerImage 
            player={currentPlayer} 
            onImageFixed={handlePlayerImageFixed}
            onImageLoaded={handleImageLoaded}
          />

          {!hasLost && isTimerRunning && (
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
