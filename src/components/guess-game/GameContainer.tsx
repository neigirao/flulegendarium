
import { GameStatus } from "./GameStatus";
import { FastPlayerImage } from "./FastPlayerImage";
import { GuessForm } from "./GuessForm";
import { Player, GameProgressInfo, DifficultyLevelInfo } from "@/types/guess-game";
import { DifficultyIndicator } from "./DifficultyIndicator";

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
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  forceRefresh: () => void;
  playerChangeCount: number;
  gameProgress?: GameProgressInfo;
  currentDifficulty?: DifficultyLevelInfo | null;
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
  gamesPlayed,
  currentStreak,
  maxStreak,
  forceRefresh,
  playerChangeCount,
  gameProgress,
  currentDifficulty
}: GameContainerProps) => {
  console.log('🎮 GameContainer render:', {
    hasCurrentPlayer: !!currentPlayer,
    playerName: currentPlayer?.name || 'null',
    gameKey,
    changeCount: playerChangeCount
  });

  if (!currentPlayer) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="text-gray-600 mb-4">Carregando jogador...</p>
        
        {/* Debug button for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <button
              onClick={forceRefresh}
              className="px-4 py-2 bg-flu-grena text-white rounded hover:bg-red-700"
            >
              Force Refresh
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Player changes: {playerChangeCount}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-flu-grena via-red-800 to-flu-verde p-4">
      {/* Header com Logo */}
      <div className="flex items-center justify-center mb-8 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mr-4">LENDAS DO F</h1>
        <div className="w-16 h-16 bg-white rounded-lg p-2">
          <div className="w-full h-full bg-flu-grena rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
        </div>
      </div>

      {/* Card Principal do Jogo */}
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
        {/* Imagem do Jogador */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <FastPlayerImage
              key={`${currentPlayer.id}-${gameKey}`}
              player={currentPlayer}
              onImageLoaded={handlePlayerImageFixed}
            />
          </div>
        </div>

        {/* Classificação de Dificuldade */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentDifficulty?.label || 'Muito Fácil'}
          </h2>
          
          {/* Estrelas de Progresso */}
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  star <= (currentStreak || 0) 
                    ? 'bg-yellow-400' 
                    : 'bg-gray-200'
                }`}
              >
                <span className="text-white text-sm">★</span>
              </div>
            ))}
          </div>
          
          {/* Próximo Nível */}
          <p className="text-gray-600 text-sm">
            Próximo nível: {currentStreak || 0}/3
          </p>
        </div>

        {/* Campo de Input */}
        <div className="mb-4">
          <GuessForm
            onSubmitGuess={handleGuess}
            disabled={isProcessingGuess || gameOver}
            isProcessing={isProcessingGuess}
          />
        </div>

        {/* Explicação e Botão Sair */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Digite o nome do jogador da foto acima
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Sair do Jogo
          </button>
        </div>
      </div>

      {/* Tempo Restante */}
      <div className="flex items-center gap-3 mt-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-flu-grena text-lg">⏰</span>
        </div>
        <div className="text-white">
          <p className="text-lg font-bold">TEMPO RESTANTE</p>
          <p className="text-2xl font-bold">{timeRemaining}s</p>
        </div>
      </div>

      {/* Controles de Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-black/20 backdrop-blur-sm rounded-lg text-white">
          <h4 className="font-semibold mb-2">Debug Controls</h4>
          <div className="flex gap-2 mb-2">
            <button
              onClick={selectRandomPlayer}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Próximo Jogador
            </button>
            <button
              onClick={forceRefresh}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="text-xs">
            <p>Player: {currentPlayer.name}</p>
            <p>Difficulty: {currentPlayer.difficulty_level || 'N/A'}</p>
            <p>Game Key: {gameKey}</p>
            <p>Changes: {playerChangeCount}</p>
          </div>
        </div>
      )}
    </div>
  );
};
