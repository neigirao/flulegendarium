import { useCallback, useEffect } from "react";
import { GuessForm } from "./GuessForm";
import { GameStatus } from "./GameStatus";
import { Player } from "@/types/guess-game";
import { PlayerImage } from "./PlayerImage";
import { usePerformance } from "@/hooks/use-performance";

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
  const { trackCustomMetric } = usePerformance();
  
  // Track image loading performance
  const handleImageLoaded = () => {
    trackCustomMetric('player_image_load', performance.now());
  };

  // Start game for player when currentPlayer is available
  useEffect(() => {
    if (currentPlayer) {
      startGameForPlayer();
    }
  }, [currentPlayer, startGameForPlayer]);

  // Select random player on component mount
  useEffect(() => {
    selectRandomPlayer();
  }, [selectRandomPlayer]);

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

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <GameStatus
        score={score}
        timeRemaining={timeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        gameOver={gameOver}
        isTimerRunning={isTimerRunning}
      />

      {/* Player Image - now with priority and performance tracking */}
      <PlayerImage
        player={currentPlayer}
        onImageFixed={handlePlayerImageFixed}
        onImageLoaded={handleImageLoaded}
        priority={true} // First image should have high priority
      />

      {/* Guess Form */}
      <GuessForm
        handleGuess={handleGuess}
        isProcessingGuess={isProcessingGuess}
        gameOver={gameOver}
        hasLost={hasLost}
      />
    </div>
  );
};
