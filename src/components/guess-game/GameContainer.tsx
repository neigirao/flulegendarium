
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
    <div className="min-h-screen bg-gradient-to-br from-flu-grena via-red-800 to-flu-verde flex items-center justify-center p-4">
      {/* Card Principal - Baseado na imagem fornecida */}
      <div className="relative w-full max-w-sm">
        
        {/* Card do Jogador */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          
          {/* Imagem do Jogador */}
          <div className="relative mb-6">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
              <FastPlayerImage
                key={`${currentPlayer.id}-${gameKey}`}
                player={currentPlayer}
                onImageLoaded={handlePlayerImageFixed}
              />
            </div>
          </div>

          {/* Título da Dificuldade */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentDifficulty?.label || 'Muito Fácil'}
            </h1>
            
            {/* Estrelas de Progresso */}
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    star <= (currentStreak || 0) 
                      ? 'bg-yellow-400' 
                      : 'bg-gray-200'
                  }`}
                >
                  <span className="text-white text-lg font-bold">★</span>
                </div>
              ))}
            </div>
            
            {/* Próximo Nível */}
            <p className="text-gray-600 text-base font-medium">
              Próximo nível: {currentStreak || 0}/3
            </p>
          </div>

          {/* Campo de Input */}
          <div className="mb-6">
            <GuessForm
              onSubmitGuess={handleGuess}
              disabled={isProcessingGuess || gameOver}
              isProcessing={isProcessingGuess}
            />
          </div>
        </div>

        {/* Seção Tempo Restante - Fora do card, na parte inferior */}
        <div className="mt-6 bg-flu-grena rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-flu-grena" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-white text-xl font-bold uppercase tracking-wide">
                TEMPO RESTANTE
              </h2>
              <div className="text-white text-2xl font-bold mt-1">
                {timeRemaining}s
              </div>
            </div>
          </div>
        </div>

        {/* Botão Sair - Pequeno e discreto */}
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-white/80 hover:text-white text-sm underline transition-colors"
          >
            Sair do Jogo
          </button>
        </div>
      </div>

      {/* Controles de Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 backdrop-blur-sm rounded-lg text-white text-xs">
          <h4 className="font-semibold mb-2">Debug</h4>
          <div className="flex gap-2 mb-2">
            <button
              onClick={selectRandomPlayer}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Next
            </button>
            <button
              onClick={forceRefresh}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs"
            >
              Refresh
            </button>
          </div>
          <div className="text-xs space-y-1">
            <p>Player: {currentPlayer.name}</p>
            <p>Difficulty: {currentPlayer.difficulty_level || 'N/A'}</p>
            <p>Changes: {playerChangeCount}</p>
          </div>
        </div>
      )}
    </div>
  );
};
