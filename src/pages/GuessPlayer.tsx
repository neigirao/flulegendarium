
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { useSimpleGuessGame } from "@/hooks/use-simple-guess-game";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { RootLayout } from "@/components/RootLayout";
import { Loader } from "@/components/guess-game/Loader";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { GameContainer } from "@/components/guess-game/GameContainer";
import { useDebug } from "@/hooks/use-debug";
import { usePlayersData } from "@/hooks/use-players-data";
import { usePlayerPreload } from "@/hooks/use-player-preload";
import { useGameState } from "@/hooks/use-game-state";

const GuessPlayer = () => {
  const { user } = useAuth();
  const [showAuthSelection, setShowAuthSelection] = useState(true);
  const { showImageUrl, handleDebugClick } = useDebug();
  
  // Carregar dados dos jogadores
  const { players, isLoading, playersError } = usePlayersData();

  // Hook principal do jogo (simplificado)
  const {
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
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    TIME_LIMIT_SECONDS
  } = useSimpleGuessGame(players);

  // Gerenciar estado do jogo
  const {
    showGameOverDialog,
    showTutorial,
    gameStarted,
    isAuthenticatedGame,
    setIsAuthenticatedGame,
    setGameStarted,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial
  } = useGameState({ hasLost });

  // Precarregar próximos jogadores
  usePlayerPreload(players, currentPlayer);

  const handleTutorialCompleteLocal = () => {
    handleTutorialComplete(user);
    if (user) {
      setShowAuthSelection(false);
      setIsAuthenticatedGame(true);
    } else {
      setShowAuthSelection(true);
    }
  };

  const handleSkipTutorialLocal = () => {
    handleSkipTutorial(user);
    if (user) {
      setShowAuthSelection(false);
      setIsAuthenticatedGame(true);
    } else {
      setShowAuthSelection(true);
    }
  };

  const handleGuestPlay = () => {
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(false);
  };

  const handleAuthenticatedPlay = () => {
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(true);
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Estado de erro
  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  // Estado sem jogadores
  if (!players || players.length === 0) {
    return <EmptyPlayersDisplay />;
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
        <div className="container mx-auto max-w-4xl">
          <GameHeader 
            score={score} 
            onDebugClick={handleDebugClick} 
          />

          <DebugInfo 
            show={showImageUrl} 
            imageUrl={currentPlayer?.image_url} 
          />

          {gameStarted && (
            <GameContainer
              currentPlayer={currentPlayer}
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
            />
          )}

          {showAuthSelection && !gameStarted && (
            <GameAuthSelection
              onGuestPlay={handleGuestPlay}
              onAuthenticatedPlay={handleAuthenticatedPlay}
            />
          )}
        </div>
      </div>

      {showTutorial && (
        <GameTutorial
          onComplete={handleTutorialCompleteLocal}
          onSkip={handleSkipTutorialLocal}
        />
      )}

      {currentPlayer && gameStarted && (
        <GameOverDialog
          open={showGameOverDialog}
          onClose={() => handleGameOverClose(selectRandomPlayer)}
          playerName={currentPlayer.name}
          score={score}
          onResetScore={resetScore}
          isAuthenticated={isAuthenticatedGame}
        />
      )}
    </RootLayout>
  );
};

export default GuessPlayer;
