
import { GameStatus } from "./GameStatus";
import { RobustPlayerImage } from "./RobustPlayerImage";
import { GuessForm } from "./GuessForm";
import { Player, GameProgressInfo, DifficultyLevel } from "@/types/guess-game";
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
  currentDifficulty?: DifficultyLevel | null;
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
  console.log('🎮 GameContainer RENDER - DADOS RECEBIDOS:', {
    hasCurrentPlayer: !!currentPlayer,
    playerName: currentPlayer?.name || 'null',
    playerId: currentPlayer?.id || 'null',
    playerImageUrl: currentPlayer?.image_url || 'null',
    gameKey,
    changeCount: playerChangeCount,
    timestamp: new Date().toISOString()
  });

  if (!currentPlayer) {
    console.log('⚠️ GameContainer - SEM JOGADOR ATUAL - mostrando loading');
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="text-gray-600 mb-4">Preparando próximo jogador...</p>
        <p className="text-sm text-gray-500">
          Aguarde enquanto selecionamos um jogador para você
        </p>
        
        {/* Debug button for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <button
              onClick={() => {
                console.log('🔧 Force Refresh clicado');
                forceRefresh();
              }}
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

  console.log('✅ GameContainer - JOGADOR VÁLIDO - renderizando jogo completo');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Status do Jogo */}
      <GameStatus
        score={score}
        timeRemaining={timeRemaining}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        currentStreak={currentStreak}
        maxStreak={maxStreak}
        gamesPlayed={gamesPlayed}
        gameOver={gameOver}
        isTimerRunning={isTimerRunning}
        onNextPlayer={selectRandomPlayer}
      />

      {/* Imagem do Jogador - Nova versão robusta */}
      <div className="mb-8">
        <RobustPlayerImage
          key={`robust-${currentPlayer.id}-${gameKey}`}
          player={currentPlayer}
          onImageLoaded={handlePlayerImageFixed}
        />
      </div>

      {/* Formulário de Palpite */}
      {!gameOver && (
        <GuessForm
          onSubmitGuess={handleGuess}
          disabled={isProcessingGuess || gameOver}
          isProcessing={isProcessingGuess}
        />
      )}

      {/* Controles de Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Controls</h4>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                console.log('🔧 Próximo Jogador clicado');
                selectRandomPlayer();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Próximo Jogador
            </button>
            <button
              onClick={() => {
                console.log('🔧 Refresh clicado');
                forceRefresh();
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="text-xs text-gray-600">
            <p>Player: {currentPlayer.name}</p>
            <p>ID: {currentPlayer.id}</p>
            <p>Game Key: {gameKey}</p>
            <p>Changes: {playerChangeCount}</p>
            <p>Image URL: {currentPlayer.image_url}</p>
            <p>Timer Running: {isTimerRunning ? 'SIM' : 'NÃO'}</p>
            <p>Game Over: {gameOver ? 'SIM' : 'NÃO'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
