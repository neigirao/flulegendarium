import React, { useState, useEffect, useCallback, useRef } from "react";
import { useJerseyGuessGame } from "@/hooks/use-jersey-guess-game";
import { useJerseysData } from "@/hooks/use-jerseys-data";
import { useAuth } from "@/hooks/auth";
import { useSkipPlayer } from "@/hooks/game";
import { useGameKeyboardShortcuts } from "@/hooks/use-game-keyboard-shortcuts";
import { BaseGameContainer } from "@/components/guess-game/BaseGameContainer";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { GuessHistoryPanel } from "@/components/guess-game/GuessHistoryPanel";
import { SkipPlayerButton } from "@/components/guess-game/SkipPlayerButton";
import { AdaptiveDifficultyIndicator } from "@/components/guess-game/AdaptiveDifficultyIndicator";
import { AdaptiveProgressionNotification } from "@/components/guess-game/AdaptiveProgressionNotification";
import { DebugInfo } from "@/components/guess-game/DebugInfo";
import { JerseyImage } from "./JerseyImage";
import { ImageFeedbackButton } from "@/components/image-feedback/ImageFeedbackButton";
import { JerseyYearOptions } from "./JerseyYearOptions";
import { KeyboardShortcutsHint } from "@/components/game/KeyboardShortcutsHint";
import { useAchievementSystem } from "@/components/achievements/AchievementSystemProvider";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { useAchievementNotifications } from "@/hooks/use-achievement-notifications";
import { useAnalytics } from "@/hooks/analytics";
import { useChallengeProgress } from "@/hooks/use-challenge-progress";
import { useGuessHistory } from "@/hooks/use-guess-history";
import { SEOManager } from "@/components/seo/SEOManager";
import { useDevToolsDetection } from "@/hooks/use-devtools-detection";
import { useGameToasts } from "@/hooks/use-game-toasts";
import { CoachMark, useOnboarding } from "@/components/onboarding";
import { ACHIEVEMENTS } from "@/types/achievements";
import { clearJerseyImageCache, prepareNextJerseyBatch } from "@/utils/jersey-image/preloadUtils";
import { 
  AnimatedContainer, 
  PlayerTransition, 
  StreakIndicator 
} from "@/components/animations/GameAnimations";
import type { DifficultyLevel, DifficultyChangeInfo } from "@/types/guess-game";

const JerseyGameContainer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [guestName, setGuestName] = useState<string>("");
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [difficultyChangeInfo, setDifficultyChangeInfo] = useState<DifficultyChangeInfo | null>(null);
  const gameToasts = useGameToasts();
  
  // Tracking state
  const hasTrackedFirstGuess = useRef(false);
  const hasTrackedGameStart = useRef(false);
  const prevGameOverRef = useRef(false);
  
  const { user } = useAuth();
  const { jerseys, isLoading, jerseysError } = useJerseysData();
  
  // Achievement hooks
  const { checkProgressAchievements, getPlayerAchievements } = useAchievementSystem();
  const { currentNotification, queueNotification, dismissNotification } = useAchievementNotifications();
  
  // Track previously unlocked achievements
  const previousAchievementsRef = useRef<string[]>([]);
  const analytics = useAnalytics();
  const { isOnboardingActive, goToStep, nextStep, isStepActive } = useOnboarding();
  const { onCorrectGuess, onStreakAchieved, onGameCompleted } = useChallengeProgress();
  const { history, addEntry, clearHistory, getStats } = useGuessHistory();
  
  const {
    currentJersey,
    gameKey,
    currentDifficulty,
    difficultyProgress,
    score,
    gameOver,
    timeRemaining,
    handleOptionSelect,
    isProcessingGuess,
    startGameForJersey,
    isTimerRunning,
    resetGame,
    gamesPlayed,
    currentStreak,
    maxStreak,
    saveToRanking,
    guessHistory,
    // Multiple choice state
    currentOptions,
    selectedOption,
    showResult
  } = useJerseyGuessGame(jerseys || []);

  // Skip player hook
  const {
    skipsUsed,
    maxSkips,
    canSkip,
    skipPenalty,
    handleSkip: performSkip,
    resetSkips,
  } = useSkipPlayer({
    maxSkips: 1,
    skipPenalty: 100,
    onSkip: () => {
      // Seleciona próxima camisa
      startGameForJersey();
    }
  });

  // Wrap skip handler
  const handleSkipPlayer = useCallback(() => {
    performSkip();
  }, [performSkip]);

  const startGameForPlayer = useCallback(() => {
    if (!hasTrackedGameStart.current) {
      analytics.trackFunnelGameStart('jersey', currentDifficulty.level);
      hasTrackedGameStart.current = true;
    }
    startGameForJersey();
  }, [startGameForJersey, analytics, currentDifficulty.level]);

  // Wrapped handleOptionSelect with funnel tracking
  const handleSelectOption = useCallback((year: number) => {
    if (!hasTrackedFirstGuess.current) {
      analytics.trackFirstGuess('jersey');
      hasTrackedFirstGuess.current = true;
    }
    
    if (isStepActive('first-guess')) {
      nextStep();
    }
    
    handleOptionSelect(year);
  }, [handleOptionSelect, analytics, isStepActive, nextStep]);

  useEffect(() => {
    if (gameOver && !prevGameOverRef.current) {
      analytics.trackGameCompleted(score, gamesPlayed, 'adaptive');
      onGameCompleted(score);
      
      if (currentJersey && guessHistory.length > 0) {
        const lastGuess = guessHistory[guessHistory.length - 1];
        addEntry({
          playerName: `Camisa ${currentJersey.years.join('/')}`,
          playerImageUrl: currentJersey.image_url,
          guess: String(lastGuess.userGuess),
          isCorrect: false,
          difficulty: currentDifficulty.label,
          timeRemaining: timeRemaining,
        });
      }
    }
    prevGameOverRef.current = gameOver;
  }, [gameOver, score, gamesPlayed, analytics, onGameCompleted, currentJersey, guessHistory, addEntry, currentDifficulty, timeRemaining]);

  // Track correct guesses
  const prevStreakRef = useRef(currentStreak);
  
  useEffect(() => {
    if (currentStreak > prevStreakRef.current && currentJersey && guessHistory.length > 0) {
      const latestGuess = guessHistory[guessHistory.length - 1];
      
      analytics.trackGuessResult(true, gamesPlayed);
      onCorrectGuess();
      onStreakAchieved(currentStreak);
      
      addEntry({
        playerName: `Camisa ${latestGuess.jerseyYears.join('/')}`,
        playerImageUrl: currentJersey.image_url,
        guess: String(latestGuess.userGuess),
        isCorrect: true,
        difficulty: currentDifficulty.label,
        pointsEarned: latestGuess.pointsEarned,
        timeRemaining: timeRemaining,
      });
      
      // Check for newly unlocked achievements
      const currentAchievements = getPlayerAchievements();
      const currentIds = currentAchievements.map(a => a.id);
      const newlyUnlocked = currentIds.filter(id => !previousAchievementsRef.current.includes(id));
      
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(achievementId => {
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) {
            queueNotification(achievement);
          }
        });
      }
      
      previousAchievementsRef.current = currentIds;
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak, guessHistory, gamesPlayed, analytics, onCorrectGuess, onStreakAchieved, getPlayerAchievements, queueNotification, currentJersey, addEntry, currentDifficulty, timeRemaining]);

  // Reset tracking refs, history, and skips when game resets
  useEffect(() => {
    if (!gameOver && gamesPlayed === 0) {
      hasTrackedFirstGuess.current = false;
      hasTrackedGameStart.current = false;
      clearHistory();
      resetSkips();
      setDifficultyChangeInfo(null);
    }
  }, [gameOver, gamesPlayed, clearHistory, resetSkips]);

  // Track difficulty changes and trigger notification
  const prevDifficultyRef = useRef(currentDifficulty.level);
  useEffect(() => {
    if (currentDifficulty.level !== prevDifficultyRef.current && gamesPlayed > 0) {
      const isLevelUp = currentDifficulty.multiplier > 1;
      setDifficultyChangeInfo({
        oldLevel: prevDifficultyRef.current,
        newLevel: currentDifficulty.level,
        direction: currentDifficulty.level > prevDifficultyRef.current ? 'up' : 'down',
        reason: isLevelUp ? 'Sequência de acertos' : 'Ajuste automático'
      });
    }
    prevDifficultyRef.current = currentDifficulty.level;
  }, [currentDifficulty.level, currentDifficulty.multiplier, gamesPlayed]);

  // Preload next batch of jerseys
  useEffect(() => {
    if (jerseys && jerseys.length > 0 && currentJersey) {
      prepareNextJerseyBatch(jerseys, currentJersey, 2);
    }
  }, [jerseys, currentJersey]);

  // Activate first-guess step when image loads
  useEffect(() => {
    if (isOnboardingActive && imageLoaded && isTimerRunning && !isStepActive('first-guess') && !isStepActive('timer-explanation')) {
      goToStep('first-guess');
    }
  }, [isOnboardingActive, imageLoaded, isTimerRunning, goToStep, isStepActive]);

  // DevTools detection - reset game when detected
  const handleDevToolsDetected = useCallback(() => {
    if (!gameOver) {
      gameToasts.showDevToolsDetected();
      resetGame();
    }
  }, [gameOver, gameToasts, resetGame]);

  useDevToolsDetection(handleDevToolsDetected, !gameOver);

  // Reset states on mount and clear image cache
  useEffect(() => {
    setImageLoaded(false);
    setCanStartTimer(false);
    clearJerseyImageCache();
    
    return () => {
      setImageLoaded(false);
      setCanStartTimer(false);
    };
  }, []);

  // Show guest name form for unauthenticated users
  useEffect(() => {
    if (!user && !guestName && !showGuestNameForm && jerseys && jerseys.length > 0) {
      setShowGuestNameForm(true);
      if (isOnboardingActive) {
        goToStep('name-input');
      }
    }
    
    analytics.trackPageView('/quiz-camisas');
    analytics.trackUserEngagement('page_view', 'jersey_game');
  }, [analytics, user, guestName, showGuestNameForm, jerseys, isOnboardingActive, goToStep]);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
    setShowGuestNameForm(false);
    setCanStartTimer(true);
    
    if (isStepActive('name-input')) {
      nextStep();
    }
  };

  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Start timer when conditions are met
  const tutorialCompleted = !isOnboardingActive;
  
  useEffect(() => {
    if (canStartTimer && imageLoaded && currentJersey && !gameOver && !isTimerRunning && tutorialCompleted) {
      startGameForPlayer();
    }
  }, [canStartTimer, imageLoaded, currentJersey, gameOver, isTimerRunning, startGameForPlayer, tutorialCompleted]);

  // Reset imageLoaded when jersey changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentJersey]);

  // Set canStartTimer for authenticated users
  useEffect(() => {
    if (user) {
      setCanStartTimer(true);
    }
  }, [user]);

  // Wrapper for saveToRanking to match GameOverDialog signature
  const handleSaveToRanking = useCallback(async (playerName: string, _score: number, _difficultyLevel?: string) => {
    await saveToRanking(playerName);
  }, [saveToRanking]);

  const handleClearDifficultyNotification = useCallback(() => {
    setDifficultyChangeInfo(null);
  }, []);

  // Handler for keyboard option selection
  const handleKeyboardOptionSelect = useCallback((index: number) => {
    if (currentOptions && currentOptions[index]) {
      handleSelectOption(currentOptions[index].year);
    }
  }, [currentOptions, handleSelectOption]);

  // Keyboard shortcuts
  const { shortcuts } = useGameKeyboardShortcuts({
    onSkip: canSkip ? handleSkipPlayer : undefined,
    onRestart: resetGame,
    onSelectOption: handleKeyboardOptionSelect,
    maxOptions: currentOptions?.length || 3,
    disabled: !isTimerRunning || showResult,
    gameOver,
    isProcessing: isProcessingGuess,
  });

  if (jerseysError) {
    return <ErrorDisplay error={jerseysError} />;
  }

  const getDifficultyLabel = (diff: DifficultyLevel): string => {
    const labels: Record<DifficultyLevel, string> = {
      muito_facil: 'Muito Fácil',
      facil: 'Fácil',
      medio: 'Médio',
      dificil: 'Difícil',
      muito_dificil: 'Muito Difícil'
    };
    return labels[diff] || diff;
  };

  // Get correct year for display in options
  const correctYear = currentJersey?.years[0];

  return (
    <>
      <SEOManager 
        title={`Quiz das Camisas - ${currentDifficulty.label} | Lendas do Flu`}
        description="Veja a camisa histórica do Fluminense e escolha o ano correto!"
        schema="Game"
      />
      
      {/* Debug Info - only in dev */}
      <DebugInfo
        show={showDebug}
        imageUrl={currentJersey?.image_url}
      />
      
      {/* Adaptive Progression Notification */}
      {difficultyChangeInfo && (
        <AdaptiveProgressionNotification
          changeInfo={difficultyChangeInfo}
          onClose={handleClearDifficultyNotification}
        />
      )}
      
      <BaseGameContainer
        title="Quiz das Camisas"
        subtitle="Adivinhe o ano das camisas históricas do Fluminense"
        icon="👕"
        isLoading={isLoading}
        loadingMessage="Carregando camisas..."
        hasPlayers={!!(jerseys && jerseys.length > 0)}
        emptyStateMessage="Nenhuma camisa encontrada para o quiz"
        playerCount={jerseys?.length}
      >
        {/* Timer with CoachMark */}
        <CoachMark
          step="timer-explanation"
          title="Fique de Olho no Tempo!"
          description="Você tem tempo limitado para escolher. Respostas rápidas valem mais pontos!"
          position="bottom"
        >
          <GameHeader 
            score={score} 
            onDebugClick={() => setShowDebug(!showDebug)}
            isAdaptiveMode={true}
            timeRemaining={timeRemaining}
            gameActive={!gameOver && isTimerRunning}
          />
        </CoachMark>
        
        <div className="mt-6 space-y-6">
          <AdaptiveDifficultyIndicator 
            currentDifficulty={currentDifficulty.level as DifficultyLevel}
            progress={difficultyProgress}
          />

          {currentJersey && (
            <div className="relative space-y-6">
              <JerseyImage
                key={`${gameKey}-${currentJersey.id}`}
                jersey={currentJersey}
                onImageLoaded={handleImageLoaded}
                difficulty={currentDifficulty.level as DifficultyLevel}
              />
              
              {/* Year Options with CoachMark */}
              <CoachMark
                step="first-guess"
                title="Escolha o Ano!"
                description="Selecione uma das opções abaixo. Cada camisa foi usada em um ano específico!"
                position="top"
              >
                <div className="flex flex-col items-center space-y-3 w-full">
                  {currentOptions.length > 0 && !gameOver && (
                    <JerseyYearOptions
                      options={currentOptions}
                      onSelectOption={handleSelectOption}
                      disabled={gameOver || !isTimerRunning}
                      isProcessing={isProcessingGuess}
                      selectedYear={selectedOption}
                      showResult={showResult}
                      correctYear={correctYear}
                    />
                  )}
                  
                  {/* Skip Player Button */}
                  <div className="flex justify-center pt-2">
                    <SkipPlayerButton
                      onSkip={handleSkipPlayer}
                      skipsUsed={skipsUsed}
                      maxSkips={maxSkips}
                      canSkip={canSkip}
                      skipPenalty={skipPenalty}
                      disabled={gameOver || isProcessingGuess || !isTimerRunning || showResult}
                    />
                  </div>
                  
                  {/* Report Problem Button - hide when game is over */}
                  {!gameOver && (
                    <div className="flex justify-center">
                      <ImageFeedbackButton
                        itemName={`Camisa ${currentJersey.years.join('/')}`}
                        itemType="jersey"
                        imageUrl={currentJersey.image_url}
                        itemId={currentJersey.id}
                        onReportSent={() => resetGame()}
                      />
                    </div>
                  )}
                </div>
              </CoachMark>
            </div>
          )}
          
          {/* Guess History Panel */}
          {history.length > 0 && (
            <GuessHistoryPanel
              history={history}
              stats={getStats()}
              compact
              className="mt-4"
            />
          )}
          
          {/* Keyboard Shortcuts Hint */}
          <KeyboardShortcutsHint 
            shortcuts={shortcuts} 
            show={!showGuestNameForm && currentJersey !== null}
            className="mt-4"
          />
        </div>
      </BaseGameContainer>

      <GameOverDialog
        open={gameOver}
        onClose={() => {}}
        playerName={currentJersey ? `Camisa de ${currentJersey.years.join('/')}` : ''}
        score={score}
        onResetScore={resetGame}
        isAuthenticated={!!user}
        onSaveToRanking={handleSaveToRanking}
        gameMode="adaptive"
        difficultyLevel={currentDifficulty.label}
        unlockedAchievementIds={getPlayerAchievements().map(a => a.id)}
      />

      {/* GuestNameForm with CoachMark */}
      {showGuestNameForm && (
        <CoachMark
          step="name-input"
          title="Qual seu Nome?"
          description="Informe seu nome para começar. Ele aparecerá no ranking se você pontuar!"
          position="bottom"
        >
          <GuestNameForm
            onNameSubmitted={handleGuestNameSubmit}
            onCancel={() => window.history.back()}
          />
        </CoachMark>
      )}

      {/* Achievement Notification */}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={dismissNotification}
        />
      )}
    </>
  );
};

export default JerseyGameContainer;
