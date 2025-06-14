
import { useCallback, useEffect } from "react";
import { GuessForm } from "./GuessForm";
import { GameStatus } from "./GameStatus";
import { GameLoadingState } from "./GameLoadingState";
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
  
  // Track image loading performance
  const handleImageLoaded = () => {
    trackCustomMetric('player_image_load', performance.now());
  };

  // Start game for player when currentPlayer is available
  useEffect(() => {
    if (currentPlayer) {
      console.log('🎮 GameContainer: Iniciando jogo para jogador:', currentPlayer.name);
      console.log('🎯 GameContainer: Score atual:', score);
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
  console.log('- Score propagado:', score);
  console.log('- Timer:', timeRemaining);
  console.log('- Game Over:', gameOver);
  console.log('- Timer Running:', isTimerRunning);

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
      {/* Game Status - Sempre visível com timer destacado e progresso */}
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

      {/* Player Image - Responsivo */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <PlayerImage
          player={currentPlayer}
          onImageFixed={handlePlayerImageFixed}
          onImageLoaded={handleImageLoaded}
          priority={true}
        />
      </div>

      {/* Loading state durante processamento */}
      {isProcessingGuess && (
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <GameLoadingState type="processing" />
        </div>
      )}

      {/* Guess Form - Responsivo */}
      {!isProcessingGuess && (
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <GuessForm
            disabled={gameOver}
            onSubmitGuess={handleGuess}
            isProcessing={isProcessingGuess}
          />
        </div>
      )}
      
      {/* Debug info detalhado - Responsivo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs md:text-sm border">
          <p><strong>Debug Info:</strong></p>
          <p>Score = {score}</p>
          <p>Timer = {timeRemaining}s</p>
          <p>Running = {isTimerRunning ? 'Sim' : 'Não'}</p>
          <p>Player = {currentPlayer?.name || 'Nenhum'}</p>
          <p>Game Over = {gameOver ? 'Sim' : 'Não'}</p>
          <p>Games Played = {gamesPlayed}</p>
          <p>Current Streak = {currentStreak}</p>
        </div>
      )}
    </div>
  );
};
