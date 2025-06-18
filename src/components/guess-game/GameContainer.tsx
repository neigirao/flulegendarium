
import { GameStatus } from "./GameStatus";
import { FastPlayerImage } from "./FastPlayerImage";
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
  if (!currentPlayer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Carregando jogador...</p>
      </div>
    );
  }

  console.log('🎮 GameContainer: Renderizando jogador', currentPlayer.name);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Indicador de Dificuldade */}
      {gameProgress && currentDifficulty && (
        <div className="mb-6 flex justify-center">
          <DifficultyIndicator 
            currentDifficulty={currentDifficulty}
            gameProgress={gameProgress}
            className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm"
          />
        </div>
      )}

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

      {/* Imagem do Jogador */}
      <div className="mb-8">
        <FastPlayerImage
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

      {/* Controles de Debug (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
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
            <button
              onClick={startGameForPlayer}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
            >
              Restart Timer
            </button>
          </div>
          <div className="text-xs text-gray-600">
            <p>Player: {currentPlayer.name}</p>
            <p>Difficulty: {currentPlayer.difficulty_level}</p>
            <p>Score: {currentPlayer.difficulty_score}</p>
            <p>Game Key: {gameKey}</p>
            <p>Changes: {playerChangeCount}</p>
            {gameProgress && (
              <>
                <p>Round: {gameProgress.currentRound}</p>
                <p>Streak: {gameProgress.currentStreak}</p>
                <p>Allowed: {gameProgress.allowedDifficulties.join(', ')}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
