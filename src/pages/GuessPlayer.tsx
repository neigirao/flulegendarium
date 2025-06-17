
import { useState, useEffect } from "react";
import { usePlayersData } from "@/hooks/use-players-data";
import { useGameEngine } from "@/hooks/use-game-engine";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { SafeLoadingBoundary } from "@/components/SafeLoadingBoundary";
import { debugLogger } from "@/utils/debugLogger";

const GuessPlayer = () => {
  debugLogger.info('GuessPlayer', 'Componente renderizado');
  
  const [gameStarted, setGameStarted] = useState(true);
  const { players, isLoading, playersError } = usePlayersData();
  const gameState = useGameEngine(players);

  useEffect(() => {
    debugLogger.info('GuessPlayer', 'Estado atualizado', {
      playersCount: players?.length,
      isLoading,
      hasError: !!playersError,
      currentPlayer: gameState.currentPlayer?.name,
      gameActive: gameState.gameActive
    });
  }, [players, isLoading, playersError, gameState.currentPlayer, gameState.gameActive]);

  // Loading state
  if (isLoading) {
    debugLogger.info('GuessPlayer', 'Exibindo estado de carregamento');
    return (
      <SafeLoadingBoundary name="Players Data" timeout={15000}>
        <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
          <Loader />
        </div>
      </SafeLoadingBoundary>
    );
  }

  // Error state
  if (playersError) {
    debugLogger.error('GuessPlayer', 'Erro ao carregar jogadores', playersError);
    return <ErrorDisplay error={playersError} />;
  }

  // Empty players state
  if (!players || players.length === 0) {
    debugLogger.warn('GuessPlayer', 'Nenhum jogador disponível');
    return <EmptyPlayersDisplay />;
  }

  // Game error state
  if (gameState.error) {
    debugLogger.error('GuessPlayer', 'Erro no estado do jogo', gameState.error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro no Jogo</h2>
          <p className="text-gray-600 mb-6">{gameState.error}</p>
          <button
            onClick={gameState.resetGame}
            className="bg-flu-grena text-white px-6 py-3 rounded-lg hover:bg-flu-grena/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  debugLogger.debug('GuessPlayer', 'Renderizando jogo principal');

  return (
    <SafeLoadingBoundary name="Game Interface">
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
        <div className="container mx-auto max-w-4xl">
          <GameHeader 
            score={gameState.score} 
            onDebugClick={() => {
              console.log('🎮 Game State Debug:', gameState);
              console.log('📊 Debug Logs:', debugLogger.getLogs());
            }} 
          />

          {gameStarted && gameState.currentPlayer && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-flu-grena mb-2">
                  Quem é este jogador?
                </h2>
                <p className="text-gray-600">
                  Tempo restante: {gameState.timeRemaining}s | Pontuação: {gameState.score}
                </p>
                {gameState.currentStreak > 0 && (
                  <p className="text-flu-verde font-semibold">
                    Sequência atual: {gameState.currentStreak} 🔥
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center space-y-6">
                {/* Player Image */}
                <div className="relative">
                  <img
                    src={gameState.currentPlayer.image_url || '/placeholder.svg'}
                    alt="Jogador misterioso"
                    className="w-64 h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      debugLogger.warn('GuessPlayer', 'Erro ao carregar imagem', {
                        player: gameState.currentPlayer?.name,
                        imageUrl: gameState.currentPlayer?.image_url
                      });
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                    onLoad={() => {
                      debugLogger.debug('GuessPlayer', 'Imagem carregada com sucesso', {
                        player: gameState.currentPlayer?.name
                      });
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
                        debugLogger.info('GuessPlayer', 'Enviando palpite', { guess: guess.trim() });
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
                    <p className="text-red-600 font-semibold mb-2">
                      Game Over! O jogador era {gameState.currentPlayer.name}
                    </p>
                    <div className="mb-4 text-sm text-gray-600">
                      <p>Pontuação final: {gameState.score}</p>
                      <p>Jogos jogados: {gameState.gamesPlayed}</p>
                      <p>Maior sequência: {gameState.maxStreak}</p>
                    </div>
                    <button
                      onClick={() => {
                        debugLogger.info('GuessPlayer', 'Reiniciando jogo');
                        gameState.resetGame();
                        setTimeout(() => gameState.selectRandomPlayer(), 100);
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
                onClick={() => {
                  debugLogger.info('GuessPlayer', 'Iniciando jogo manualmente');
                  gameState.selectRandomPlayer();
                }}
                className="px-6 py-3 bg-flu-grena text-white rounded-lg hover:bg-flu-grena/90"
              >
                Iniciar Jogo
              </button>
            </div>
          )}
        </div>
      </div>
    </SafeLoadingBoundary>
  );
};

export default GuessPlayer;
