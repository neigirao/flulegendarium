
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { DifficultyIndicator } from "@/components/guess-game/DifficultyIndicator";
import { useSimpleGuessGame } from "@/hooks/use-simple-guess-game";
import { useEnhancedPlayerSelection } from "@/hooks/use-enhanced-player-selection";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
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

const GuessPlayer = () => {
  const { user } = useAuth();
  const [showAuthSelection, setShowAuthSelection] = useState(true);
  const { showImageUrl, handleDebugClick } = useDebug();
  const { trackError, log } = useObservability();
  
  const { players, isLoading, playersError } = usePlayersData();

  // Enhanced player selection with difficulty intelligence
  const {
    currentPlayer,
    selectRandomPlayer,
    handlePlayerImageFixed,
    handleGuessResult,
    resetPlayerSelection,
    getSessionStats
  } = useEnhancedPlayerSelection(players);

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
  
  // Game logic
  const {
    gameKey,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    forceRefresh,
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
    log('info', 'GuessPlayer page loaded with intelligent selection', {
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
    
    trackGameStart({
      sessionId: `auth_${user?.id}_${Date.now()}`,
      startTime: Date.now(),
      isAuthenticated: true,
      playerName: user?.email,
      gameMode: 'authenticated'
    });
  };

  // Enhanced guess handler with difficulty tracking
  const handleGuessWithTracking = async (guess: string) => {
    const guessStartTime = Date.now();
    const result = await handleGuess(guess);
    const guessEndTime = Date.now();
    const timeToGuess = guessEndTime - guessStartTime;
    
    if (currentPlayer) {
      // Track with enhanced metrics
      trackPlayerGuess(
        currentPlayer.name,
        guess,
        result,
        timeToGuess,
        score - (result ? 0 : 5),
        score
      );
      
      // Record result for difficulty algorithm
      await handleGuessResult(result, timeToGuess);
    }
    
    return result;
  };

  // Enhanced game over handler
  const handleGameOverCloseLocal = () => {
    const sessionData = {
      sessionId: `session_${Date.now()}`,
      startTime: Date.now() - 120000,
      isAuthenticated: isAuthenticatedGame,
      playerName: guestPlayerName
    };
    
    const metrics = {
      sessionDuration: 120000,
      totalGuesses: attempts.length,
      correctGuesses: score / 5,
      accuracy: (score / 5) / Math.max(attempts.length, 1)
    };
    
    trackGameEnd(sessionData, metrics);
    handleGameOverClose(() => {
      selectRandomPlayer();
      resetPlayerSelection();
    });
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

  const sessionStats = getSessionStats();

  console.log('🎮 GuessPlayer Enhanced Render with Intelligent Selection:', {
    playerName: currentPlayer?.name,
    gameKey,
    gameStarted,
    changeCount: playerChangeCount,
    guestPlayerName,
    trackingActive: true,
    sessionStats
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

          {/* Difficulty Indicator */}
          {gameStarted && sessionStats && (
            <div className="mb-4">
              <DifficultyIndicator
                currentDifficulty={sessionStats.currentDifficulty}
                sessionStats={sessionStats}
                showDetails={false}
              />
            </div>
          )}

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
