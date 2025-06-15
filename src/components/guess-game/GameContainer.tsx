import { useCallback, useEffect } from "react";
import { GuessForm } from "./GuessForm";
import { GameStatus } from "./GameStatus";
import { GameLoadingState } from "./GameLoadingState";
import { Player } from "@/types/guess-game";
import { SimplePlayerImage } from "./SimplePlayerImage";
import { usePerformance } from "@/hooks/use-performance";
import { useErrorHandler } from "@/hooks/use-error-handler";

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
  gamesPlayed?: number;
  currentStreak?: number;
  maxStreak?: number;
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
  isTimerRunning,
  gamesPlayed = 0,
  currentStreak = 0,
  maxStreak = 0
}: GameContainerProps) => {
  const { trackCustomMetric } = usePerformance();
  const { handleError } = useErrorHandler();
  
  // Track image loading performance with error handling
  const handleImageLoaded = useCallback(() => {
    try {
      trackCustomMetric('player_image_load', performance.now());
    } catch (error) {
      handleError(error as Error, 'GameContainer.handleImageLoaded');
    }
  }, [trackCustomMetric, handleError]);

  // Start game for player when currentPlayer is available
  useEffect(() => {
    try {
      if (currentPlayer) {
        console.log('🎮 GameContainer: Iniciando jogo para jogador:', currentPlayer.name);
        startGameForPlayer();
      }
    } catch (error) {
      handleError(error as Error, 'GameContainer.startGameForPlayer');
    }
  }, [currentPlayer, startGameForPlayer, handleError]);

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

  // Debug logs
  console.log('🎮 GameContainer State:');
  console.log('- Player:', currentPlayer?.name || 'Nenhum');
  console.log('- Score:', score);
  console.log('- Timer:', timeRemaining);
  console.log('- Game Over:', gameOver);

  // Loading state quando não há jogador
  if (!currentPlayer) {
    return (
      <div className="space-y-4 md:space-y-6">
        <GameLoadingState type="player" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Player Image - PRIMEIRO (acima do progresso) */}
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

      {/* Guess Form - SEGUNDO (abaixo da imagem) */}
      {!isProcessingGuess && (
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <GuessForm
            disabled={gameOver}
            onSubmitGuess={handleGuess}
            isProcessing={isProcessingGuess}
          />
        </div>
      )}

      {/* Game Status - TERCEIRO (pontuação, timer e progresso abaixo do formulário) */}
      <GameStatus
        score={score}
        timeRemaining={timeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        gameOver={gameOver}
        isTimerRunning={isTimerRunning}
        gamesPlayed={gamesPlayed}
        currentStreak={currentStreak}
        maxStreak={maxStreak}
        onNextPlayer={selectRandomPlayer}
      />
      
      {/* Debug info em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs md:text-sm border">
          <p><strong>Debug Info:</strong></p>
          <p>Score = {score}</p>
          <p>Timer = {timeRemaining}s</p>
          <p>Player = {currentPlayer?.name}</p>
          <p>Image URL = {currentPlayer?.image_url}</p>
        </div>
      )}
    </div>
  );
};
