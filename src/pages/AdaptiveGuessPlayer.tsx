
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { useAdaptiveGuessGame } from "@/hooks/use-adaptive-guess-game";
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
import { useGameMetrics } from "@/hooks/use-game-metrics";

const AdaptiveGuessPlayer = () => {
  const { user } = useAuth();
  const [showAuthSelection, setShowAuthSelection] = useState(true);
  const { showImageUrl, handleDebugClick } = useDebug();
  const { trackError, log } = useObservability();
  const { trackGameAbandonment, trackConversion } = useGameMetrics();
  
  const { players, isLoading, playersError } = usePlayersData();

  // Using adaptive game hook with difficulty progression
  const {
    currentPlayer,
    currentDifficulty,
    gameKey,
    attempts,
    score,
    gameOver,
    timeRemaining,
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
    difficultyProgress,
    difficultyChangeInfo,
    clearDifficultyChange,
    saveToRanking
  } = useAdaptiveGuessGame(players);

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
        component: 'AdaptiveGuessPlayer',
        action: 'loadPlayers'
      });
    }
  }, [playersError, trackError]);

  // Track page navigation
  useEffect(() => {
    log('info', 'AdaptiveGuessPlayer page loaded', {
      hasUser: !!user,
      playersCount: players?.length || 0,
      gameStarted,
      adaptiveDifficultyEnabled: true,
      currentDifficulty: currentDifficulty
    });
  }, [log, user, players, gameStarted, currentDifficulty]);

  const handleTutorialCompleteLocal = () => {
    log('info', 'Adaptive tutorial completed', { hasUser: !!user });
    handleTutorialComplete(user);
  };

  const handleSkipTutorialLocal = () => {
    log('info', 'Adaptive tutorial skipped', { hasUser: !!user });
    handleSkipTutorial(user);
  };

  const handleGuestPlay = () => {
    log('info', 'Adaptive guest play selected');
    setShowAuthSelection(false);
    setGameStarted(true);
    setIsAuthenticatedGame(false);
  };

  const handleAuthenticatedPlay = () => {
    log('info', 'Adaptive authenticated play selected', { userId: user?.id });
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
            sessionId: `adaptive_session_${Date.now()}`,
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

  // Check if there are players for adaptive mode
  const availablePlayersCount = players?.length || 0;
  if (availablePlayersCount === 0 && gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-flu-grena mb-4">
              Modo Adaptativo Indisponível
            </h2>
            <p className="text-gray-600 mb-4">
              Não há jogadores classificados para o nível de dificuldade atual.
            </p>
            <p className="text-sm text-gray-500">
              Os administradores precisam classificar os jogadores por nível de dificuldade.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎮 AdaptiveGuessPlayer Render:', {
    playerName: currentPlayer?.name,
    difficulty: currentDifficulty,
    gameKey,
    gameStarted,
    guestPlayerName,
    availablePlayersCount
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
              attempts={attempts}
              score={score}
              gameOver={gameOver}
              timeRemaining={timeRemaining}
              MAX_ATTEMPTS={1}
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
              playerChangeCount={0}
              gameProgress={{
                currentRound: gamesPlayed + 1,
                currentStreak,
                allowedDifficulties: [currentDifficulty.level as any],
                nextDifficultyThreshold: 3
              }}
              currentDifficulty={{
                level: currentDifficulty.level as any,
                label: currentDifficulty.label,
                color: 'text-blue-600 bg-blue-50',
                icon: '⭐⭐⭐',
                multiplier: currentDifficulty.multiplier
              }}
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
          onSaveToRanking={saveToRanking}
          gameMode="adaptive"
          difficultyLevel={currentDifficulty.label}
        />
      )}
    </RootLayout>
  );
};

export default AdaptiveGuessPlayer;
