import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { AdaptiveTutorial } from "@/components/guess-game/AdaptiveTutorial";
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
  const [showAuthSelection, setShowAuthSelection] = useState(!user);
  const [showAdaptiveTutorial, setShowAdaptiveTutorial] = useState(false);
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

  // Update auth selection when user changes
  useEffect(() => {
    setShowAuthSelection(!user && !gameStarted);
  }, [user, gameStarted]);

  // Show adaptive tutorial after regular tutorial
  useEffect(() => {
    if (gameStarted && !showTutorial) {
      const hasSeenAdaptiveTutorial = localStorage.getItem('adaptive-tutorial-seen');
      if (!hasSeenAdaptiveTutorial) {
        setShowAdaptiveTutorial(true);
      }
    }
  }, [gameStarted, showTutorial]);

  const handleTutorialCompleteLocal = () => {
    log('info', 'Adaptive tutorial completed', { hasUser: !!user });
    handleTutorialComplete(user);
  };

  const handleSkipTutorialLocal = () => {
    log('info', 'Adaptive tutorial skipped', { hasUser: !!user });
    handleSkipTutorial(user);
  };

  const handleAdaptiveTutorialComplete = () => {
    setShowAdaptiveTutorial(false);
    localStorage.setItem('adaptive-tutorial-seen', 'true');
  };

  const handleGuestPlay = () => {
    log('info', 'Adaptive guest play selected');
    setShowAuthSelection(false);
    // Trigger tutorial after auth selection
  };

  const handleAuthenticatedPlay = () => {
    log('info', 'Adaptive authenticated play selected', { userId: user?.id });
    trackConversion(false, 'login');
    setShowAuthSelection(false);
    // Trigger tutorial after auth selection
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
    showTutorial,
    showAdaptiveTutorial,
    showGuestNameForm,
    showAuthSelection,
    guestPlayerName,
    availablePlayersCount
  });

  return (
    <RootLayout>
      {/* Header customizado para o jogo */}
      {gameStarted && !showAdaptiveTutorial && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-flu-grena via-red-800 to-flu-verde">
          <div className="flex items-center justify-between p-4 pt-12">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5 text-flu-grena" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-flu-grena font-medium">Menu</span>
            </button>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-flu-grena">{score}</div>
                <div className="text-sm text-flu-grena font-medium">pontos</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-flu-grena via-red-800 to-flu-verde">
        <div className="container mx-auto max-w-4xl">

          <DebugInfo 
            show={showImageUrl} 
            imageUrl={currentPlayer?.image_url} 
          />

          {gameStarted && !showAdaptiveTutorial && (
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
            <div className="text-center py-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <img 
                    src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                    alt="Fluminense FC" 
                    className="w-12 h-12 object-contain"
                  />
                  <h2 className="text-2xl font-bold text-flu-grena">Como você quer jogar?</h2>
                </div>
                <GameAuthSelection
                  onGuestPlay={handleGuestPlay}
                  onAuthenticatedPlay={handleAuthenticatedPlay}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showTutorial && (
        <GameTutorial
          onComplete={handleTutorialCompleteLocal}
          onSkip={handleSkipTutorialLocal}
        />
      )}

      {showAdaptiveTutorial && (
        <AdaptiveTutorial 
          isOpen={showAdaptiveTutorial}
          onComplete={handleAdaptiveTutorialComplete}
        />
      )}

      {showGuestNameForm && (
        <GuestNameForm
          onNameSubmitted={handleGuestNameSubmitted}
          onCancel={handleGuestNameCancel}
        />
      )}

      {currentPlayer && gameStarted && !showAdaptiveTutorial && (
        <GameOverDialog
          open={showGameOverDialog}
          onClose={() => handleGameOverClose(selectRandomPlayer)}
          playerName={currentPlayer.name}
          score={score}
          onResetScore={resetScore}
          isAuthenticated={!!user}
          onSaveToRanking={saveToRanking}
          gameMode="adaptive"
          difficultyLevel={currentDifficulty.label}
        />
      )}
    </RootLayout>
  );
};

export default AdaptiveGuessPlayer;
