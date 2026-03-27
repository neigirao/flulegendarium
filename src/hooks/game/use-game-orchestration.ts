import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/auth';
import { useAchievementSystem } from '@/components/achievements/AchievementSystemProvider';
import { useAchievementNotifications } from '@/hooks/use-achievement-notifications';
import { useAnalytics } from '@/hooks/analytics';
import { useChallengeProgress } from '@/hooks/use-challenge-progress';
import { useGuessHistory } from '@/hooks/use-guess-history';
import { useSkipPlayer } from './use-skip-player';
import { useGameKeyboardShortcuts } from '@/hooks/use-game-keyboard-shortcuts';
import { useDevToolsDetection } from '@/hooks/use-devtools-detection';
import { useGameToasts } from '@/hooks/use-game-toasts';
import { useOnboarding } from '@/components/onboarding';
import { ACHIEVEMENTS } from '@/types/achievements';
import type { DifficultyChangeInfo, DifficultyLevel } from '@/types/guess-game';

export interface GameOrchestrationConfig {
  gameMode: string;
  pagePath: string;
  currentItem: { id: string; name: string; image_url: string } | null;
  gameOver: boolean;
  score: number;
  gamesPlayed: number;
  currentStreak: number;
  currentDifficulty: { level: string; label: string; multiplier: number };
  difficultyProgress: number;
  isTimerRunning: boolean;
  isProcessingGuess: boolean;
  timeRemaining: number;
  startGame: () => void;
  resetGame: () => void;
  selectNext: () => void;
  dataReady: boolean;
  clearImageCache: () => void;
  // Keyboard shortcut options
  keyboardOptions?: {
    onSelectOption?: (index: number) => void;
    maxOptions?: number;
    extraDisabled?: boolean;
  };
}

export const useGameOrchestration = (config: GameOrchestrationConfig) => {
  const {
    gameMode, pagePath, currentItem, gameOver, score, gamesPlayed,
    currentStreak, currentDifficulty, difficultyProgress, isTimerRunning,
    isProcessingGuess, timeRemaining, startGame, resetGame, selectNext,
    dataReady, clearImageCache, keyboardOptions,
  } = config;

  // Shared state
  const [guestName, setGuestName] = useState('');
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [difficultyChangeInfo, setDifficultyChangeInfo] = useState<DifficultyChangeInfo | null>(null);

  // Tracking refs
  const hasTrackedFirstGuess = useRef(false);
  const hasTrackedGameStart = useRef(false);
  const prevGameOverRef = useRef(false);
  const prevStreakRef = useRef(0);
  const prevDifficultyRef = useRef(currentDifficulty.level);
  const previousAchievementsRef = useRef<string[]>([]);
  const lastGuessRef = useRef('');

  // Hooks
  const { user } = useAuth();
  const { getPlayerAchievements } = useAchievementSystem();
  const { currentNotification, queueNotification, dismissNotification } = useAchievementNotifications();
  const analytics = useAnalytics();
  const gameToasts = useGameToasts();
  const { isOnboardingActive, goToStep, nextStep, isStepActive } = useOnboarding();
  const { onCorrectGuess, onStreakAchieved, onGameCompleted } = useChallengeProgress();
  const { history, addEntry, clearHistory, getStats } = useGuessHistory();

  // Skip player
  const {
    skipsUsed, maxSkips, canSkip, skipPenalty,
    handleSkip: performSkip, resetSkips,
  } = useSkipPlayer({
    maxSkips: 1,
    skipPenalty: 100,
    onSkip: selectNext,
  });

  const handleSkipPlayer = useCallback(() => {
    performSkip();
  }, [performSkip]);

  // --- Analytics & tracking effects ---

  // Track game start
  useEffect(() => {
    if (isTimerRunning && !hasTrackedGameStart.current) {
      analytics.trackFunnelGameStart(gameMode, currentDifficulty.level);
      hasTrackedGameStart.current = true;
    }
  }, [isTimerRunning, gameMode, analytics, currentDifficulty.level]);

  // Track game completion
  useEffect(() => {
    if (gameOver && !prevGameOverRef.current) {
      analytics.trackGameCompleted(score, gamesPlayed, gameMode);
      onGameCompleted(score);

      if (currentItem && lastGuessRef.current) {
        addEntry({
          playerName: currentItem.name,
          playerImageUrl: currentItem.image_url,
          guess: lastGuessRef.current,
          isCorrect: false,
          difficulty: currentDifficulty.label,
          timeRemaining,
        });
      }
    }
    prevGameOverRef.current = gameOver;
  }, [gameOver, score, gamesPlayed, gameMode, analytics, onGameCompleted, currentItem, addEntry, currentDifficulty.label, timeRemaining]);

  // Track correct guesses via streak changes
  useEffect(() => {
    if (currentStreak > prevStreakRef.current && currentItem) {
      analytics.trackGuessResult(true, gamesPlayed);
      onCorrectGuess();
      onStreakAchieved(currentStreak);

      addEntry({
        playerName: currentItem.name,
        playerImageUrl: currentItem.image_url,
        guess: lastGuessRef.current,
        isCorrect: true,
        difficulty: currentDifficulty.label,
        pointsEarned: Math.floor(5 * (currentDifficulty.multiplier || 1)),
        timeRemaining,
      });

      // Check for newly unlocked achievements
      const currentAchievements = getPlayerAchievements();
      const currentIds = currentAchievements.map(a => a.id);
      const newlyUnlocked = currentIds.filter(id => !previousAchievementsRef.current.includes(id));
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(achievementId => {
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) queueNotification(achievement);
        });
      }
      previousAchievementsRef.current = currentIds;
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak, gamesPlayed, analytics, onCorrectGuess, onStreakAchieved, getPlayerAchievements, queueNotification, currentItem, addEntry, currentDifficulty, timeRemaining]);

  // Track difficulty changes
  useEffect(() => {
    if (currentDifficulty.level !== prevDifficultyRef.current && gamesPlayed > 0) {
      setDifficultyChangeInfo({
        oldLevel: prevDifficultyRef.current as DifficultyLevel,
        newLevel: currentDifficulty.level as DifficultyLevel,
        direction: currentDifficulty.level > prevDifficultyRef.current ? 'up' : 'down',
        reason: currentDifficulty.multiplier > 1 ? 'Sequência de acertos' : 'Ajuste automático',
      });
    }
    prevDifficultyRef.current = currentDifficulty.level;
  }, [currentDifficulty.level, currentDifficulty.multiplier, gamesPlayed]);

  // Reset tracking on game reset
  useEffect(() => {
    if (!gameOver && gamesPlayed === 0) {
      hasTrackedFirstGuess.current = false;
      hasTrackedGameStart.current = false;
      clearHistory();
      resetSkips();
      setDifficultyChangeInfo(null);
    }
  }, [gameOver, gamesPlayed, clearHistory, resetSkips]);

  // --- Onboarding effects ---

  useEffect(() => {
    if (isOnboardingActive && imageLoaded && isTimerRunning && !isStepActive('first-guess') && !isStepActive('timer-explanation')) {
      goToStep('first-guess');
    }
  }, [isOnboardingActive, imageLoaded, isTimerRunning, goToStep, isStepActive]);

  // --- DevTools detection ---

  const handleDevToolsDetected = useCallback((reason: 'f12' | 'context_inspect' | 'background_detected') => {
    if (!gameOver) {
      if (reason === 'f12' || reason === 'context_inspect') {
        gameToasts.showDevToolsDetected();
      }
      resetGame();
    }
  }, [gameOver, gameToasts, resetGame]);

  useDevToolsDetection(handleDevToolsDetected, !gameOver);

  // --- Mount / unmount ---

  useEffect(() => {
    setImageLoaded(false);
    setCanStartTimer(false);
    clearImageCache();
    return () => {
      setImageLoaded(false);
      setCanStartTimer(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Guest name form ---

  useEffect(() => {
    if (!user && !guestName && !showGuestNameForm && dataReady) {
      setShowGuestNameForm(true);
      if (isOnboardingActive) goToStep('name-input');
    }
    analytics.trackPageView(pagePath);
    analytics.trackUserEngagement('page_view', `${gameMode}_game`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, guestName, showGuestNameForm, dataReady]);

  const handleGuestNameSubmit = useCallback((name: string) => {
    setGuestName(name);
    setShowGuestNameForm(false);
    setCanStartTimer(true);
    if (isStepActive('name-input')) nextStep();
  }, [isStepActive, nextStep]);

  // --- Image loaded ---

  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // --- Timer start coordination ---

  const tutorialCompleted = !isOnboardingActive;

  useEffect(() => {
    if (canStartTimer && imageLoaded && currentItem && !gameOver && !isTimerRunning && tutorialCompleted) {
      startGame();
    }
  }, [canStartTimer, imageLoaded, currentItem, gameOver, isTimerRunning, startGame, tutorialCompleted]);

  // Reset imageLoaded when item changes (by ID, not reference)
  const prevItemIdRef = useRef<string | null>(null);
  useEffect(() => {
    const itemId = currentItem?.id ?? null;
    if (itemId !== prevItemIdRef.current) {
      prevItemIdRef.current = itemId;
      if (prevItemIdRef.current !== null) {
        // Only reset for subsequent items, not the first load
        setImageLoaded(false);
      }
    }
  }, [currentItem?.id]);

  // Set canStartTimer for authenticated users
  useEffect(() => {
    if (user) setCanStartTimer(true);
  }, [user]);

  // --- Guess wrapper ---

  const wrapGuess = useCallback((originalGuess: (g: string) => void) => {
    return (guess: string) => {
      if (!hasTrackedFirstGuess.current) {
        analytics.trackFirstGuess(gameMode);
        hasTrackedFirstGuess.current = true;
      }
      if (isStepActive('first-guess')) nextStep();
      lastGuessRef.current = guess;
      originalGuess(guess);
    };
  }, [analytics, gameMode, isStepActive, nextStep]);

  const handleClearDifficultyNotification = useCallback(() => {
    setDifficultyChangeInfo(null);
  }, []);

  // --- Keyboard shortcuts ---

  const { shortcuts } = useGameKeyboardShortcuts({
    onSkip: canSkip ? handleSkipPlayer : undefined,
    onRestart: resetGame,
    onSelectOption: keyboardOptions?.onSelectOption,
    maxOptions: keyboardOptions?.maxOptions,
    disabled: !isTimerRunning || (keyboardOptions?.extraDisabled ?? false),
    gameOver,
    isProcessing: isProcessingGuess,
  });

  return {
    // Auth
    user,
    // State
    guestName,
    showGuestNameForm,
    showDebug,
    setShowDebug,
    imageLoaded,
    difficultyChangeInfo,
    // Handlers
    handleGuestNameSubmit,
    handleImageLoaded,
    handleSkipPlayer,
    handleClearDifficultyNotification,
    wrapGuess,
    onGuestCancel: () => window.history.back(),
    // Skip state
    skipsUsed, maxSkips, canSkip, skipPenalty,
    // Keyboard
    shortcuts,
    // Achievements
    currentNotification, dismissNotification,
    unlockedAchievementIds: getPlayerAchievements().map(a => a.id),
    // History
    history, addEntry, getStats,
    // Onboarding helpers (re-exported for CoachMark usage)
    isOnboardingActive, isStepActive,
  };
};
