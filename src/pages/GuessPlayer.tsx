
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GameTutorial } from "@/components/guess-game/GameTutorial";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { DifficultyIndicator } from "@/components/guess-game/DifficultyIndicator";
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
import { useSimpleGameTimer } from "@/hooks/use-simple-game-timer";
import { useGameScore } from "@/hooks/use-game-score";
import { useToast } from "@/components/ui/use-toast";
import { isCorrectGuess } from "@/utils/name-processor";

const GuessPlayer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Game score management
  const { score, currentStreak, gamesPlayed, maxStreak, addScore, resetStreak, resetAll } = useGameScore();

  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);

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

  // Timer
  const { timeRemaining, isRunning, startTimer, stopTimer, resetTimer } = useSimpleGameTimer(() => {
    if (!gameOver && currentPlayer && gameActive) {
      console.log('⏰ Tempo esgotado para:', currentPlayer.name);
      setGameOver(true);
      setHasLost(true);
      setGameActive(false);
      resetStreak();
      
      toast({
        variant: "destructive",
        title: "Tempo esgotado!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  });

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

  // Start game when player is selected
  useEffect(() => {
    if (currentPlayer && !gameOver && gameStarted) {
      console.log('🎮 Iniciando jogo para:', currentPlayer.name);
      setGameOver(false);
      setHasLost(false);
      setGameActive(true);
      resetTimer();
      startTimer();
    }
  }, [currentPlayer, gameStarted, gameOver, startTimer, resetTimer]);

  // Handle guess logic
  const handleGuess = async (guess: string) => {
    if (!currentPlayer || !guess || gameOver || isProcessingGuess || !gameActive) return;
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    setIsProcessingGuess(true);
    
    try {
      const guessStartTime = Date.now();
      const isCorrect = isCorrectGuess(guess, currentPlayer.name);
      const guessEndTime = Date.now();
      const timeToGuess = guessEndTime - guessStartTime;
      
      // Record result for difficulty algorithm
      await handleGuessResult(isCorrect, timeToGuess);
      
      if (isCorrect) {
        const points = 5;
        console.log('🎯 ACERTOU! Pontos ganhos:', points);
        
        stopTimer();
        addScore(points);
        
        toast({
          title: "Parabéns!",
          description: `Você acertou! +${points} pontos`,
        });
        
        // Track success
        trackPlayerGuess(
          currentPlayer.name,
          guess,
          true,
          timeToGuess,
          score,
          score + points
        );
        
        // Select next player after a brief delay
        setTimeout(() => {
          console.log('🔄 Selecionando próximo jogador após acerto...');
          selectRandomPlayer();
          setIsProcessingGuess(false);
        }, 800);
      } else {
        console.log('❌ ERROU! Resposta:', guess, 'Esperado:', currentPlayer.name);
        
        resetStreak();
        setGameOver(true);
        setHasLost(true);
        setGameActive(false);
        stopTimer();
        
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}.`,
        });
        
        // Track failure
        trackPlayerGuess(
          currentPlayer.name,
          guess,
          false,
          timeToGuess,
          score,
          score
        );
        
        setIsProcessingGuess(false);
      }
    } catch (error) {
      console.error("Erro ao processar palpite:", error);
      setIsProcessingGuess(false);
    }
  };

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
      totalGuesses: gamesPlayed,
      correctGuesses: score / 5,
      accuracy: (score / 5) / Math.max(gamesPlayed, 1)
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

  // Reset score function
  const resetScore = () => {
    console.log('🎯 Resetando pontuação');
    resetAll();
    setGameActive(false);
    resetPlayerSelection();
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

  console.log('🎮 GuessPlayer Render:', {
    playerName: currentPlayer?.name,
    gameStarted,
    score,
    gamesPlayed,
    timeRemaining,
    isRunning
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
              gameKey={`${currentPlayer?.id || 'none'}-${Date.now()}`}
              attempts={0}
              score={score}
              gameOver={gameOver}
              timeRemaining={timeRemaining}
              MAX_ATTEMPTS={1}
              handleGuess={handleGuess}
              selectRandomPlayer={handleReplay}
              handlePlayerImageFixed={handlePlayerImageFixed}
              isProcessingGuess={isProcessingGuess}
              hasLost={hasLost}
              startGameForPlayer={() => {}}
              isTimerRunning={isRunning}
              gamesPlayed={gamesPlayed}
              currentStreak={currentStreak}
              maxStreak={maxStreak}
              forceRefresh={() => selectRandomPlayer()}
              playerChangeCount={gamesPlayed}
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
