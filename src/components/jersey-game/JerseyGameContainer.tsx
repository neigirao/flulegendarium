import React, { useState, useEffect, useCallback, useRef } from "react";
import { useJerseyGuessGame } from "@/hooks/use-jersey-guess-game";
import { useJerseysData } from "@/hooks/use-jerseys-data";
import { useAuth } from "@/hooks/auth";
import { BaseGameContainer } from "@/components/guess-game/BaseGameContainer";
import { GameHeader } from "@/components/guess-game/GameHeader";
import { GameOverDialog } from "@/components/guess-game/GameOverDialog";
import { GuestNameForm } from "@/components/guess-game/GuestNameForm";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { GuessHistoryPanel } from "@/components/guess-game/GuessHistoryPanel";
import { AdaptiveDifficultyIndicator } from "@/components/guess-game/AdaptiveDifficultyIndicator";
import { JerseyImage } from "./JerseyImage";
import { JerseyGuessForm } from "./JerseyGuessForm";
import { useAchievementSystem } from "@/components/achievements/AchievementSystemProvider";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { useAchievementNotifications } from "@/hooks/use-achievement-notifications";
import { useEnhancedAnalytics } from "@/hooks/analytics";
import { useFunnelAnalytics } from "@/hooks/use-funnel-analytics";
import { useChallengeProgress } from "@/hooks/use-challenge-progress";
import { useGuessHistory } from "@/hooks/use-guess-history";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { useDevToolsDetection } from "@/hooks/use-devtools-detection";
import { useToast } from "@/hooks/use-toast";
import { CoachMark, useOnboarding } from "@/components/onboarding";
import { ACHIEVEMENTS } from "@/types/achievements";
import type { DifficultyLevel } from "@/types/guess-game";

const JerseyGameContainer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [guestName, setGuestName] = useState<string>("");
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lastGuessResult, setLastGuessResult] = useState<{ isCorrect: boolean; hint?: 'higher' | 'lower'; correctYear: number; userGuess: number; pointsEarned: number } | null>(null);
  const { toast } = useToast();
  
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
  const analytics = useEnhancedAnalytics();
  const funnel = useFunnelAnalytics();
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
    handleGuess: originalHandleGuess,
    isProcessingGuess,
    startGameForJersey,
    isTimerRunning,
    resetGame,
    gamesPlayed,
    currentStreak,
    maxStreak,
    saveToRanking,
    guessHistory
  } = useJerseyGuessGame(jerseys || []);

  // Wrapped startGameForJersey with funnel tracking
  const startGameForPlayer = useCallback(() => {
    if (!hasTrackedGameStart.current) {
      funnel.trackGameStart('jersey', currentDifficulty.level);
      hasTrackedGameStart.current = true;
    }
    startGameForJersey();
  }, [startGameForJersey, funnel, currentDifficulty.level]);

  // Track last guess for history
  const lastGuessRef = useRef<number>(0);

  // Wrapped handleGuess with funnel tracking and result tracking
  const handleGuess = useCallback((year: number) => {
    if (!hasTrackedFirstGuess.current) {
      funnel.trackFirstGuess('jersey');
      hasTrackedFirstGuess.current = true;
    }
    
    if (isStepActive('first-guess')) {
      nextStep();
    }
    
    lastGuessRef.current = year;
    originalHandleGuess(year);
    
    // Track result from guessHistory after guess
    setTimeout(() => {
      if (guessHistory.length > 0) {
        const latestGuess = guessHistory[guessHistory.length - 1];
        const closestYear = latestGuess.jerseyYears[0];
        setLastGuessResult({
          isCorrect: latestGuess.isCorrect,
          hint: latestGuess.userGuess < closestYear ? 'higher' : 'lower',
          correctYear: latestGuess.matchedYear || closestYear,
          userGuess: latestGuess.userGuess,
          pointsEarned: latestGuess.pointsEarned
        });
      }
    }, 100);
  }, [originalHandleGuess, funnel, isStepActive, nextStep, guessHistory]);

  useEffect(() => {
    if (gameOver && !prevGameOverRef.current) {
      funnel.trackGameCompleted(score, gamesPlayed, 'adaptive');
      onGameCompleted(score);
      
      if (currentJersey && lastGuessRef.current) {
        addEntry({
          playerName: `Camisa ${currentJersey.years.join('/')}`,
          playerImageUrl: currentJersey.image_url,
          guess: String(lastGuessRef.current),
          isCorrect: false,
          difficulty: currentDifficulty.label,
          timeRemaining: timeRemaining,
        });
      }
    }
    prevGameOverRef.current = gameOver;
  }, [gameOver, score, gamesPlayed, funnel, onGameCompleted, currentJersey, addEntry, currentDifficulty, timeRemaining]);

  // Track correct guesses
  const prevStreakRef = useRef(currentStreak);
  
  useEffect(() => {
    if (currentStreak > prevStreakRef.current && currentJersey && guessHistory.length > 0) {
      const latestGuess = guessHistory[guessHistory.length - 1];
      
      funnel.trackGuessResult(true, gamesPlayed);
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
  }, [currentStreak, guessHistory, gamesPlayed, funnel, onCorrectGuess, onStreakAchieved, getPlayerAchievements, queueNotification, currentJersey, addEntry, currentDifficulty, timeRemaining]);

  // Reset tracking refs and history when game resets
  useEffect(() => {
    if (!gameOver && gamesPlayed === 0) {
      hasTrackedFirstGuess.current = false;
      hasTrackedGameStart.current = false;
      clearHistory();
    }
  }, [gameOver, gamesPlayed, clearHistory]);

  // Activate first-guess step when image loads
  useEffect(() => {
    if (isOnboardingActive && imageLoaded && isTimerRunning && !isStepActive('first-guess') && !isStepActive('timer-explanation')) {
      goToStep('first-guess');
    }
  }, [isOnboardingActive, imageLoaded, isTimerRunning, goToStep, isStepActive]);

  // DevTools detection - reset game when detected
  const handleDevToolsDetected = useCallback(() => {
    if (!gameOver) {
      toast({
        variant: "destructive",
        title: "Jogo Encerrado",
        description: "Uso de ferramentas de inspeção detectado. O jogo foi finalizado.",
      });
      resetGame();
    }
  }, [gameOver, toast, resetGame]);

  useDevToolsDetection(handleDevToolsDetected, !gameOver);

  // Reset states on mount
  useEffect(() => {
    setImageLoaded(false);
    setCanStartTimer(false);
    
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

  if (jerseysError) {
    return <ErrorDisplay error={jerseysError} />;
  }

  // Wrapper for saveToRanking to match GameOverDialog signature
  const handleSaveToRanking = useCallback(async (playerName: string, _score: number, _difficultyLevel?: string) => {
    await saveToRanking(playerName);
  }, [saveToRanking]);

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

  return (
    <>
      <DynamicSEO 
        gameMode="adaptive"
        difficulty={currentDifficulty.label}
      />
      
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
          description="Você tem tempo limitado para adivinhar. Respostas exatas valem mais pontos!"
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
            <div className="relative">
              <JerseyImage
                key={`${gameKey}-${currentJersey.id}`}
                jersey={currentJersey}
                onImageLoaded={handleImageLoaded}
                difficulty={currentDifficulty.level as DifficultyLevel}
              />
              
              {/* GuessForm with CoachMark */}
              <CoachMark
                step="first-guess"
                title="Faça seu Palpite!"
                description="Digite o ano que você acha que essa camisa foi usada. Anos próximos também pontuam!"
                position="top"
              >
                <JerseyGuessForm
                  onSubmitGuess={handleGuess}
                  disabled={gameOver || isProcessingGuess}
                  isProcessing={isProcessingGuess}
                />
              </CoachMark>
              
              {/* Show hint after wrong guess */}
              {lastGuessResult && !lastGuessResult.isCorrect && (
                <div className="mt-4 text-center">
                  <p className="text-muted-foreground">
                    {lastGuessResult.hint === 'higher' 
                      ? '📈 O ano correto é mais recente!' 
                      : '📉 O ano correto é mais antigo!'}
                  </p>
                </div>
              )}
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
      <AchievementNotification
        achievement={currentNotification}
        onClose={dismissNotification}
      />
    </>
  );
};

export default JerseyGameContainer;