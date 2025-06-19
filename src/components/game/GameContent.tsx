
import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { Player } from "@/types/guess-game";

interface GameContentProps {
  gameStarted: boolean;
  showImageUrl: boolean;
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
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  forceRefresh: () => void;
  playerChangeCount: number;
}

export const GameContent = ({
  gameStarted,
  showImageUrl,
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
  gamesPlayed,
  currentStreak,
  maxStreak,
  forceRefresh,
  playerChangeCount
}: GameContentProps) => {
  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Breadcrumbs className="mb-6" />
        
        <DebugInfo 
          show={showImageUrl} 
          imageUrl={currentPlayer?.image_url} 
        />

        {gameStarted && (
          <GameContainer
            currentPlayer={currentPlayer}
            gameKey={gameKey.toString()}
            attempts={attempts}
            score={score}
            gameOver={gameOver}
            timeRemaining={timeRemaining}
            MAX_ATTEMPTS={MAX_ATTEMPTS}
            handleGuess={handleGuess}
            selectRandomPlayer={selectRandomPlayer}
            handlePlayerImageFixed={handlePlayerImageFixed}
            isProcessingGuess={isProcessingGuess}
            hasLost={hasLost}
            startGameForPlayer={startGameForPlayer}
            isTimerRunning={isTimerRunning}
            gamesPlayed={gamesPlayed}
            currentStreak={currentStreak}
            maxStreak={maxStreak}
            forceRefresh={forceRefresh}
            playerChangeCount={playerChangeCount}
          />
        )}
      </div>
    </div>
  );
};
