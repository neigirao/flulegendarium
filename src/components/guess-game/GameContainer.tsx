
import { useCallback, useEffect } from "react";
import { GuessForm } from "./GuessForm";
import { GameLoadingState } from "./GameLoadingState";
import { GameTimer } from "./GameTimer";
import { Player } from "@/types/guess-game";
import { SimplePlayerImage } from "./SimplePlayerImage";
import { usePerformance } from "@/hooks/use-performance";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface GameContainerProps {
  currentPlayer: Player | null;
  gameKey: string;
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
  gamesPlayed?: number;
  currentStreak?: number;
  maxStreak?: number;
  forceRefresh?: () => void;
  playerChangeCount?: number;
}

export const GameContainer = ({
  currentPlayer,
  gameKey,
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
  isTimerRunning,
  gamesPlayed = 0,
  currentStreak = 0,
  maxStreak = 0,
  forceRefresh,
  playerChangeCount = 0
}: GameContainerProps) => {
  const { trackCustomMetric } = usePerformance();
  const { handleError } = useErrorHandler();
  
  const handleImageLoaded = useCallback(() => {
    try {
      trackCustomMetric('player_image_load', performance.now());
    } catch (error) {
      handleError(error as Error, 'GameContainer.handleImageLoaded');
    }
  }, [trackCustomMetric, handleError]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  console.log('🎮 GameContainer State:', {
    playerName: currentPlayer?.name || 'Nenhum',
    score,
    timer: timeRemaining,
    gameOver,
    isTimerRunning
  });

  if (!currentPlayer) {
    return (
      <div className="space-y-4 md:space-y-6">
        <GameLoadingState type="player" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Timer */}
      <div className="flex justify-center">
        <GameTimer
          timeRemaining={timeRemaining}
          isRunning={isTimerRunning}
          gameOver={gameOver}
        />
      </div>

      {/* Player Image */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <SimplePlayerImage
          player={currentPlayer}
          onImageLoaded={handleImageLoaded}
        />
      </div>

      {/* Loading state durante processamento */}
      {isProcessingGuess && (
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <GameLoadingState type="processing" />
        </div>
      )}

      {/* Guess Form */}
      {!isProcessingGuess && (
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <GuessForm
            disabled={gameOver}
            onSubmitGuess={handleGuess}
            isProcessing={isProcessingGuess}
          />
        </div>
      )}

      {/* Game Status */}
      <div className="w-full max-w-md md:max-w-lg mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-flu-verde/20">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-flu-grena to-flu-grena/90 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏆</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pontuação</p>
              <p className="text-2xl font-bold text-flu-grena">{score}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-xs text-gray-500">Jogos</p>
              <p className="text-lg font-semibold text-flu-grena">{gamesPlayed}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sequência</p>
              <p className="text-lg font-semibold text-flu-verde">{currentStreak}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Recorde</p>
              <p className="text-lg font-semibold text-flu-grena">{maxStreak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug controls em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs border">
          <p><strong>Debug Info:</strong></p>
          <p>Player: {currentPlayer?.name} ({currentPlayer?.id})</p>
          <p>Game Key: {gameKey}</p>
          <p>Score: {score} | Timer: {timeRemaining}s | Running: {isTimerRunning ? 'YES' : 'NO'}</p>
          <p>Games Played: {gamesPlayed} | Current Streak: {currentStreak}</p>
          <p className="break-all">Image URL: {currentPlayer?.image_url}</p>
          
          <div className="mt-2 flex gap-2">
            <button 
              onClick={selectRandomPlayer}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Próximo Jogador
            </button>
            {forceRefresh && (
              <button 
                onClick={forceRefresh}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              >
                Force Refresh
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
