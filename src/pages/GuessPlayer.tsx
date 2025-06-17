
import { useState } from "react";
import { usePlayersData } from "@/hooks/use-players-data";
import { useSimpleGuessGame } from "@/hooks/use-simple-guess-game";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";

const GuessPlayer = () => {
  const [gameStarted, setGameStarted] = useState(true);
  const { players, isLoading, playersError } = usePlayersData();

  const {
    currentPlayer,
    score,
    gameOver,
    timeRemaining,
    isProcessingGuess,
    gameActive,
    handleGuess,
    selectRandomPlayer,
    resetGame,
    handlePlayerImageFixed
  } = useSimpleGuessGame(players);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  if (!players || players.length === 0) {
    return <EmptyPlayersDisplay />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <GameHeader score={score} onDebugClick={() => {}} />

        {gameStarted && currentPlayer && (
          <GameContainer
            currentPlayer={currentPlayer}
            gameKey={`${currentPlayer.id}-${Date.now()}`}
            attempts={0}
            score={score}
            gameOver={gameOver}
            timeRemaining={timeRemaining}
            MAX_ATTEMPTS={1}
            handleGuess={handleGuess}
            selectRandomPlayer={selectRandomPlayer}
            handlePlayerImageFixed={handlePlayerImageFixed}
            isProcessingGuess={isProcessingGuess}
            hasLost={gameOver}
            startGameForPlayer={() => {}}
            isTimerRunning={gameActive}
            gamesPlayed={Math.floor(score / 5)}
            currentStreak={0}
            maxStreak={0}
            forceRefresh={selectRandomPlayer}
            playerChangeCount={Math.floor(score / 5)}
          />
        )}

        {gameOver && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                resetGame();
                selectRandomPlayer();
              }}
              className="bg-flu-grena text-white px-6 py-3 rounded-lg hover:bg-flu-grena/90 transition-colors"
            >
              Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessPlayer;
