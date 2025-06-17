
import { useState } from "react";
import { usePlayersData } from "@/hooks/use-players-data";
import { useSimpleGuessGame } from "@/hooks/use-simple-guess-game";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";

const GuessPlayer = () => {
  const [gameStarted, setGameStarted] = useState(true);
  const { players, isLoading, playersError } = usePlayersData();

  const gameState = useSimpleGuessGame(players);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Error state
  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  // Empty players state
  if (!players || players.length === 0) {
    return <EmptyPlayersDisplay />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <GameHeader score={gameState.score} onDebugClick={() => console.log('Debug:', gameState)} />

        {gameStarted && gameState.currentPlayer && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-flu-grena mb-2">
                Quem é este jogador?
              </h2>
              <p className="text-gray-600">
                Tempo restante: {gameState.timeRemaining}s | Pontuação: {gameState.score}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              {/* Player Image */}
              <div className="relative">
                <img
                  src={gameState.currentPlayer.image_url || '/placeholder.svg'}
                  alt="Jogador misterioso"
                  className="w-64 h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Guess Form */}
              <div className="w-full max-w-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const guess = formData.get('guess') as string;
                    if (guess?.trim()) {
                      gameState.handleGuess(guess.trim());
                      e.currentTarget.reset();
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="guess"
                    placeholder="Digite o nome do jogador..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flu-grena"
                    disabled={gameState.isProcessingGuess || gameState.gameOver}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={gameState.isProcessingGuess || gameState.gameOver}
                    className="px-6 py-2 bg-flu-grena text-white rounded-lg hover:bg-flu-grena/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gameState.isProcessingGuess ? 'Processando...' : 'Enviar'}
                  </button>
                </form>
              </div>

              {/* Game Status */}
              {gameState.gameOver && (
                <div className="text-center">
                  <p className="text-red-600 font-semibold mb-4">
                    Game Over! O jogador era {gameState.currentPlayer.name}
                  </p>
                  <button
                    onClick={() => {
                      gameState.resetGame();
                      gameState.selectRandomPlayer();
                    }}
                    className="px-6 py-2 bg-flu-grena text-white rounded-lg hover:bg-flu-grena/90"
                  >
                    Jogar Novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!gameState.currentPlayer && !isLoading && (
          <div className="text-center mt-8">
            <button
              onClick={gameState.selectRandomPlayer}
              className="px-6 py-3 bg-flu-grena text-white rounded-lg hover:bg-flu-grena/90"
            >
              Iniciar Jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessPlayer;
