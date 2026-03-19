
import { GameStatus } from "./GameStatus";
import { UnifiedPlayerImage } from "@/components/player-image/UnifiedPlayerImage";
import { GuessForm } from "./GuessForm";
import { Player, GameProgressInfo, DifficultyLevelInfo } from "@/types/guess-game";
import { DifficultyIndicator } from "./DifficultyIndicator";
import { GameTimer } from "./GameTimer";
import { ImageFeedbackButton } from "@/components/image-feedback/ImageFeedbackButton";
import { Clock } from "lucide-react";

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
  onReportProblem?: () => void;
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
  currentDifficulty,
  onReportProblem
}: GameContainerProps) => {

  if (!currentPlayer) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="text-muted-foreground mb-4">Carregando jogador...</p>
        
        {/* Debug button for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <button
              onClick={forceRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Force Refresh
            </button>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Player changes: {playerChangeCount}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-6 pb-4 px-4" data-testid="game-container">
      
      {/* Timer - igual ao adaptativo */}
      <div className="flex justify-center mb-6">
        <div data-testid="timer-display" className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Tempo</span>
          </div>
          <GameTimer 
            timeRemaining={timeRemaining} 
            isRunning={isTimerRunning} 
            gameOver={gameOver}
          />
        </div>
      </div>
      
      {/* Container Principal Centralizado */}
      <div className="relative w-full max-w-sm mx-auto">
          
          {/* Card do Jogador */}
          <div className="bg-card rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            
            {/* Imagem do Jogador com Borda Verde */}
            <div className="relative mb-6">
              <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden border-4 border-secondary p-2">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  <UnifiedPlayerImage
                    key={`${currentPlayer.id}-${gameKey}`}
                    player={currentPlayer}
                    onImageLoaded={handlePlayerImageFixed}
                    priority={true}
                  />
                </div>
              </div>
            </div>

          {/* Título da Dificuldade */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {currentDifficulty?.label || 'Muito Fácil'}
            </h1>
            
            {/* Estrelas de Progresso */}
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    star <= (currentStreak || 0) 
                      ? 'bg-warning' 
                      : 'bg-muted'
                  }`}
                >
                  <span className="text-warning-foreground text-lg font-bold">★</span>
                </div>
              ))}
            </div>
            
            {/* Próximo Nível */}
            <p className="text-muted-foreground text-base font-medium">
              Próximo nível: {currentStreak || 0}/3
            </p>
          </div>

          {/* Campo de Input */}
          <div className="mb-6 flex flex-col items-center">
            <GuessForm
              onSubmitGuess={handleGuess}
              disabled={isProcessingGuess || gameOver}
              isProcessing={isProcessingGuess}
            />
          </div>
          
          {/* Report Problem Button */}
          {onReportProblem && (
            <div className="flex justify-center mb-4">
              <ImageFeedbackButton
                itemName={currentPlayer.name}
                itemType="player"
                imageUrl={currentPlayer.image_url}
                itemId={currentPlayer.id}
                onReportSent={onReportProblem}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controles de Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-4 bg-foreground/80 backdrop-blur-sm rounded-lg text-background text-xs">
          <h4 className="font-semibold mb-2">Debug</h4>
          <div className="flex gap-2 mb-2">
            <button
              onClick={selectRandomPlayer}
              className="px-2 py-1 bg-info text-info-foreground rounded text-xs"
            >
              Next
            </button>
            <button
              onClick={forceRefresh}
              className="px-2 py-1 bg-success text-success-foreground rounded text-xs"
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
