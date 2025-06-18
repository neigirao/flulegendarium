
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
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
import { use GameState } from "@/hooks/use-game-state";
import { useObservability } from "@/hooks/use-observability";
import { useGameMetrics } from "@/hooks/use-game-metrics";
import { useEffect } from "react";

const GuessPlayer = () => {
  const { user } = useAuth();
  const [showAuthSelection, setShowAuthSelection] = useState(true);
  const { showImageUrl, handleDebugClick } = useDebug();
  const { trackError, log } = useObservability();
  const { trackGameAbandonment, trackConversion } = useGameMetrics();
  
  const { players, isLoading, playersError } = usePlayersData();

  // Enhanced game hook with adaptive difficulty
  const {
    currentPlayer,
    gameKey,
    gameProgress,
    currentDifficulty,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    playerChangeCount,
    TIME_LIMIT_SECONDS
  } = useSimpleGuessGame(players);

  const {
    showGameOverDialog,
    showTutorial,
    gameStarted,
    isAuthenticatedGame,
    showGuestNameForm,
    guestPlayerName,
    setIsAuthenticatedGame,
    setGameStarted,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial,
    handleGuestNameSubmitted,
    handleGuestNameCancel
  } = useGameState({ hasLost });

  usePlayerPreload(players, currentPlayer);

  // Enhanced error handling
  useEffect(() => {
    if (playersError) {
      trackError(playersError as Error, {
        severity: 'critical',
        component: 'GuessPlayer',
        action: 'loadPlayers'
      });
    }
  }, [playersError, trackError]);

  // Track page navigation
  useEffect(() => {
    log('info', 'GuessPlayer page loaded', {
      hasUser: !!user,
      playersCount: players?.length || 0,
      gameStarted,
      adaptiveDifficultyEnabled: true
    });
  }, [log, user, players, gameStarted]);

  const handleTutorialCompleteLocal = () => {
    log('info', 'Tutorial completed', { hasUser: !!user });
    handleTutorialComplete(user);
  };

  const handleSkipTutorialLocal = () => {
    log('info', 'Tutorial skipped', { hasUser: !!user });
    handleSkipTutorial(user);
  };

  const handleGuestPlay = () => {
    log('info', 'Guest play selected');
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(false);
  };

  const handleAuthenticatedPlay = () => {
    log('info', 'Authenticated play selected', { userId: user?.id });
    trackConversion(false, 'login');
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(true);
  };

  // Track game abandonment on unmount
  useEffect(() => {
    return () => {
      if (gameStarted && !gameOver) {
        trackGameAbandonment(
          {
            sessionId: `session_${Date.now()}`,
            startTime: Date.now(),
            isAuthenticated: isAuthenticatedGame,
            playerName: guestPlayerName
          },
          'gameplay'
        );
      }
    };
  }, [gameStarted, gameOver, isAuthenticatedGame, guestPlayerName, trackGameAbandonment]);

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

  console.log('🎮 GuessPlayer Render:', {
    playerName: currentPlayer?.name,
    difficulty: currentPlayer?.difficulty_level,
    gameKey,
    gameStarted,
    changeCount: playerChangeCount,
    guestPlayerName,
    currentProgress: gameProgress
  });

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
              gameKey={gameKey.toString()}
              attempts={attempts.length}
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
              gameProgress={gameProgress}
              currentDifficulty={currentDifficulty}
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

      {showGuestNameForm && (
        <GuestNameForm
          onNameSubmitted={handleGuestNameSubmitted}
          onCancel={handleGuestNameCancel}
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
          guestPlayerName={guestPlayerName}
        />
      )}
    </RootLayout>
  );
};

export default GuessPlayer;
