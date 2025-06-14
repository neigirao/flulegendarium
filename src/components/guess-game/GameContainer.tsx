
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
      console.log('🎮 GameContainer: Iniciando jogo para jogador:', currentPlayer.name);
      startGameForPlayer();
    }
  }, [currentPlayer, startGameForPlayer]);

  // Select random player on component mount
  useEffect(() => {
    console.log('🎮 GameContainer: Selecionando jogador inicial');
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

  // Debug logs para verificar props
  console.log('🎮 GameContainer Props:');
  console.log('- Player:', currentPlayer?.name);
  console.log('- Score:', score);
  console.log('- Timer:', timeRemaining);
  console.log('- Game Over:', gameOver);
  console.log('- Timer Running:', isTimerRunning);

  return (
    <div className="space-y-6">
      {/* Game Status - Sempre visível com timer e pontuação */}
      <GameStatus
        score={score}
        timeRemaining={timeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        gameOver={gameOver}
        onNextPlayer={selectRandomPlayer}
      />

      {/* Player Image */}
      <PlayerImage
        player={currentPlayer}
        onImageFixed={handlePlayerImageFixed}
        onImageLoaded={handleImageLoaded}
        priority={true}
      />

      {/* Guess Form */}
      <GuessForm
        disabled={gameOver}
        onSubmitGuess={handleGuess}
        isProcessing={isProcessingGuess}
      />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>Debug: Score={score}, Timer={timeRemaining}, Running={isTimerRunning}</p>
        </div>
      )}
    </div>
  );
};
