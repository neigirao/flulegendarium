
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
import { useGameState } from "@/hooks/use-game-state";
import { useObservability } from "@/hooks/use-observability";
import { useEnhancedGameMetrics } from "@/hooks/use-enhanced-game-metrics";
import { useAdvancedUserTracking } from "@/hooks/use-advanced-user-tracking";
import { useEffect } from "react";

const GuessPlayer = () => {
  const { user } = useAuth();
  const [showAuthSelection, setShowAuthSelection] = useState(true);
  const { showImageUrl, handleDebugClick } = useDebug();
  const { trackError, log } = useObservability();
  
  // Enhanced tracking hooks
  const { 
    trackGameStart, 
    trackPlayerGuess, 
    trackGameEnd, 
    trackGameAbandonment,
    trackTutorialEvent,
    trackGameReplay
  } = useEnhancedGameMetrics();
  
  const { trackPageView, trackInteraction } = useAdvancedUserTracking();
  
  const { players, isLoading, playersError } = usePlayersData();

  // Enhanced game hook
  const {
    currentPlayer,
    gameKey,
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

  // Track page load with enhanced metrics
  useEffect(() => {
    trackPageView('/guess-player');
    log('info', 'GuessPlayer page loaded', {
      hasUser: !!user,
      playersCount: players?.length || 0,
      gameStarted,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }, [log, user, players, gameStarted, trackPageView]);

  // Enhanced tutorial handlers
  const handleTutorialCompleteLocal = () => {
    log('info', 'Tutorial completed', { hasUser: !!user });
    trackTutorialEvent('complete');
    handleTutorialComplete(user);
  };

  const handleSkipTutorialLocal = () => {
    log('info', 'Tutorial skipped', { hasUser: !!user });
    trackTutorialEvent('skip');
    handleSkipTutorial(user);
  };

  // Enhanced game start handlers
  const handleGuestPlay = () => {
    log('info', 'Guest play selected');
    trackInteraction('auth_selection', 'guest_play');
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(false);
    
    // Track game start with enhanced data
    trackGameStart({
      sessionId: `guest_${Date.now()}`,
      startTime: Date.now(),
      isAuthenticated: false,
      gameMode: 'guest'
    });
  };

  const handleAuthenticatedPlay = () => {
    log('info', 'Authenticated play selected', { userId: user?.id });
    trackInteraction('auth_selection', 'authenticated_play');
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(true);
    
    // Track game start with enhanced data
    trackGameStart({
      sessionId: `auth_${user?.id}_${Date.now()}`,
      startTime: Date.now(),
      isAuthenticated: true,
      playerName: user?.email,
      gameMode: 'authenticated'
    });
  };

  // Enhanced guess handler
  const handleGuessWithTracking = (guess: string) => {
    const guessStartTime = Date.now();
    
    // Call original handler
    handleGuess(guess);
    
    // Enhanced tracking
    if (currentPlayer) {
      const timeToGuess = guessStartTime - (Date.now() - 30000); // Approximate
      trackPlayerGuess(
        currentPlayer.name,
        guess,
        guess.toLowerCase() === currentPlayer.name.toLowerCase(),
        Math.abs(timeToGuess),
        score - 5, // previous score
        score // current score
      );
    }
  };

  // Enhanced game over handler
  const handleGameOverCloseLocal = () => {
    const sessionData = {
      sessionId: `session_${Date.now()}`,
      startTime: Date.now() - 120000, // approximate
      isAuthenticated: isAuthenticatedGame,
      playerName: guestPlayerName
    };
    
    const metrics = {
      sessionDuration: 120000, // approximate
      totalGuesses: attempts.length,
      correctGuesses: score / 5,
      accuracy: (score / 5) / Math.max(attempts.length, 1)
    };
    
    trackGameEnd(sessionData, metrics);
    handleGameOverClose(selectRandomPlayer);
  };

  // Enhanced replay handler
  const handleReplay = () => {
    trackGameReplay();
    selectRandomPlayer();
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

  console.log('🎮 GuessPlayer Enhanced Render:', {
    playerName: currentPlayer?.name,
    gameKey,
    gameStarted,
    changeCount: playerChangeCount,
    guestPlayerName,
    trackingActive: true
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
              handleGuess={handleGuessWithTracking}
              selectRandomPlayer={handleReplay}
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
          onClose={handleGameOverCloseLocal}
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
