import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// ─── GA4 Event Types ───
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// ─── Funnel Step Types ───
export type FunnelStep =
  | 'page_view_home'
  | 'page_view_game_selection'
  | 'page_view_game'
  | 'game_mode_click'
  | 'game_started'
  | 'first_guess'
  | 'correct_guess'
  | 'incorrect_guess'
  | 'game_completed'
  | 'ranking_save_shown'
  | 'ranking_saved'
  | 'share_shown'
  | 'share_completed'
  | 'auth_prompt_shown'
  | 'auth_started'
  | 'auth_completed'
  | 'play_again';

interface FunnelEvent {
  step: FunnelStep;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

// ─── Enhanced Analytics Types ───
interface PlayerGuessEvent {
  playerName: string;
  userGuess: string;
  isCorrect: boolean;
  timeToGuess: number;
  difficulty: string;
  gameMode: string;
}

interface GameSessionEvent {
  sessionId: string;
  duration: number;
  totalGuesses: number;
  correctGuesses: number;
  accuracy: number;
  gameMode: string;
  userId?: string;
}

// ─── Session Management ───
const FUNNEL_STORAGE_KEY = 'flu_funnel_session';
const SESSION_TIMEOUT = 30 * 60 * 1000;

const getSessionId = () => {
  const stored = sessionStorage.getItem(FUNNEL_STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    if (Date.now() - data.lastActivity < SESSION_TIMEOUT) {
      return data.sessionId;
    }
  }
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify({ sessionId, lastActivity: Date.now() }));
  return sessionId;
};

const updateSessionActivity = () => {
  const stored = sessionStorage.getItem(FUNNEL_STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    data.lastActivity = Date.now();
    sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(data));
  }
};

const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// ─── Unified Analytics Hook ───
// Merges: use-analytics + use-enhanced-analytics + use-funnel-analytics
export const useAnalytics = () => {
  // GA4 batching
  const gaQueueRef = useRef<AnalyticsEvent[]>([]);
  const gaTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Funnel batching
  const funnelQueueRef = useRef<FunnelEvent[]>([]);
  const funnelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(getSessionId());

  // ─── GA4 Layer ───
  const flushGA = useCallback(() => {
    const queue = gaQueueRef.current;
    if (queue.length === 0) return;
    queue.forEach(event => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      }
    });
    gaQueueRef.current = [];
  }, []);

  const trackEvent = useCallback(({ action, category, label, value }: AnalyticsEvent) => {
    gaQueueRef.current.push({ action, category, label, value });
    if (gaTimerRef.current) clearTimeout(gaTimerRef.current);
    gaTimerRef.current = setTimeout(flushGA, 2000);
    logger.debug('Analytics Event Queued', 'ANALYTICS', { action, category, label, value });
  }, [flushGA]);

  const trackPageView = useCallback((page: string) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-X2VE77MEYC', { page_path: page });
        }
      });
    } else {
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-X2VE77MEYC', { page_path: page });
        }
      }, 100);
    }
  }, []);

  // ─── Enhanced Analytics Layer (convenience wrappers) ───
  const trackGameStart = useCallback((mode: string) => {
    trackEvent({ action: 'game_start', category: 'Game', label: mode });
  }, [trackEvent]);

  const trackGameEnd = useCallback((score: number, correctGuesses: number) => {
    trackEvent({ action: 'game_end', category: 'Game', label: 'score', value: score });
    trackEvent({ action: 'game_end', category: 'Game', label: 'correct_guesses', value: correctGuesses });
  }, [trackEvent]);

  const trackCorrectGuess = useCallback((playerName: string) => {
    trackEvent({ action: 'correct_guess', category: 'Game', label: playerName });
  }, [trackEvent]);

  const trackIncorrectGuess = useCallback((playerName: string, userGuess: string) => {
    trackEvent({ action: 'incorrect_guess', category: 'Game', label: `${playerName} - guessed: ${userGuess}` });
  }, [trackEvent]);

  const trackAchievementUnlocked = useCallback((achievementName: string) => {
    trackEvent({ action: 'achievement_unlocked', category: 'Achievements', label: achievementName });
  }, [trackEvent]);

  const trackSocialShare = useCallback((platform: string, score: number) => {
    trackEvent({ action: 'social_share', category: 'Social', label: platform, value: score });
  }, [trackEvent]);

  const trackSignupStart = useCallback(() => {
    trackEvent({ action: 'signup_start', category: 'Funnel', label: 'registration_initiated' });
  }, [trackEvent]);

  const trackSignupComplete = useCallback((method: string = 'email') => {
    trackEvent({ action: 'signup_complete', category: 'Funnel', label: method });
  }, [trackEvent]);

  const trackDifficultyChange = useCallback((fromLevel: string, toLevel: string) => {
    trackEvent({ action: 'difficulty_change', category: 'Game', label: `${fromLevel}_to_${toLevel}` });
  }, [trackEvent]);

  const trackSessionDuration = useCallback((durationSeconds: number, gameMode: string) => {
    trackEvent({ action: 'session_duration', category: 'Engagement', label: gameMode, value: durationSeconds });
  }, [trackEvent]);

  const trackPlayerGuess = useCallback((event: PlayerGuessEvent) => {
    trackEvent({
      action: event.isCorrect ? 'correct_guess' : 'incorrect_guess',
      category: 'Game',
      label: `${event.playerName} - ${event.gameMode} - ${event.difficulty}`,
      value: Math.round(event.timeToGuess / 1000),
    });
    trackEvent({
      action: 'guess_time',
      category: 'Performance',
      label: event.isCorrect ? 'correct' : 'incorrect',
      value: Math.round(event.timeToGuess / 1000),
    });
  }, [trackEvent]);

  const trackGameSession = useCallback((event: GameSessionEvent) => {
    trackEvent({ action: 'game_session_complete', category: 'Game', label: event.gameMode, value: event.accuracy });
    trackEvent({ action: 'session_duration', category: 'Engagement', label: event.gameMode, value: Math.round(event.duration / 1000) });
    trackEvent({ action: 'guess_volume', category: 'Engagement', label: event.gameMode, value: event.totalGuesses });
  }, [trackEvent]);

  const trackUserEngagement = useCallback((action: string, detail?: string) => {
    trackEvent({ action, category: 'User_Engagement', label: detail });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    trackEvent({ action, category: 'Feature_Usage', label: feature });
  }, [trackEvent]);

  const trackPerformanceMetric = useCallback((metric: string, value: number, label?: string) => {
    trackEvent({ action: metric, category: 'Performance', label, value });
  }, [trackEvent]);

  // ─── Funnel Layer (persists to Supabase) ───
  const flushFunnel = useCallback(async () => {
    if (funnelQueueRef.current.length === 0) return;
    const events = [...funnelQueueRef.current];
    funnelQueueRef.current = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const eventsToInsert = events.map(event => ({
        session_id: sessionId.current,
        user_id: user?.id || null,
        event_type: event.step,
        event_data: event.metadata || {},
        page_url: typeof window !== 'undefined' ? window.location.pathname : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        device_type: getDeviceType()
      }));

      const { error } = await supabase.from('funnel_events').insert(eventsToInsert);
      if (error) {
        logger.warn('Failed to persist funnel events', 'ANALYTICS', { error: error.message });
      } else {
        logger.debug('Funnel events persisted', 'ANALYTICS', { count: events.length });
      }
    } catch (err) {
      logger.warn('Error persisting funnel events', 'ANALYTICS', { error: String(err) });
    }

    // Also send to GA4
    events.forEach(event => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'funnel_step', {
          event_category: 'Funnel',
          event_label: event.step,
          custom_session_id: sessionId.current,
          ...event.metadata
        });
      }
    });
  }, []);

  const trackFunnelStep = useCallback((step: FunnelStep, metadata?: Record<string, string | number | boolean>) => {
    updateSessionActivity();
    funnelQueueRef.current.push({ step, timestamp: Date.now(), metadata });
    logger.debug('Funnel step tracked', 'ANALYTICS', { step, metadata });
    if (funnelTimerRef.current) clearTimeout(funnelTimerRef.current);
    funnelTimerRef.current = setTimeout(flushFunnel, 1000);
  }, [flushFunnel]);

  // ─── Funnel Convenience Methods ───
  const trackFunnelPageView = useCallback((page: 'home' | 'game_selection' | 'game') => {
    trackFunnelStep(`page_view_${page}` as FunnelStep);
  }, [trackFunnelStep]);

  const trackGameModeClick = useCallback((mode: string) => {
    trackFunnelStep('game_mode_click', { mode });
  }, [trackFunnelStep]);

  const trackFunnelGameStart = useCallback((mode: string, difficulty?: string) => {
    trackFunnelStep('game_started', { mode, difficulty: difficulty || 'unknown' });
  }, [trackFunnelStep]);

  const trackFirstGuess = useCallback((mode: string) => {
    trackFunnelStep('first_guess', { mode });
  }, [trackFunnelStep]);

  const trackGuessResult = useCallback((correct: boolean, attemptNumber: number) => {
    trackFunnelStep(correct ? 'correct_guess' : 'incorrect_guess', { attempt_number: attemptNumber });
  }, [trackFunnelStep]);

  const trackGameCompleted = useCallback((score: number, correctGuesses: number, mode: string) => {
    trackFunnelStep('game_completed', { score, correct_guesses: correctGuesses, mode });
  }, [trackFunnelStep]);

  const trackRankingSaveShown = useCallback(() => {
    trackFunnelStep('ranking_save_shown');
  }, [trackFunnelStep]);

  const trackRankingSaved = useCallback((score: number) => {
    trackFunnelStep('ranking_saved', { score });
  }, [trackFunnelStep]);

  const trackShareShown = useCallback(() => {
    trackFunnelStep('share_shown');
  }, [trackFunnelStep]);

  const trackShareCompleted = useCallback((platform: string) => {
    trackFunnelStep('share_completed', { platform });
  }, [trackFunnelStep]);

  const trackAuthPromptShown = useCallback((location: string) => {
    trackFunnelStep('auth_prompt_shown', { location });
  }, [trackFunnelStep]);

  const trackAuthStarted = useCallback((method: string) => {
    trackFunnelStep('auth_started', { method });
  }, [trackFunnelStep]);

  const trackAuthCompleted = useCallback((method: string) => {
    trackFunnelStep('auth_completed', { method });
  }, [trackFunnelStep]);

  const trackPlayAgain = useCallback((mode: string, previousScore: number) => {
    trackFunnelStep('play_again', { mode, previous_score: previousScore });
  }, [trackFunnelStep]);

  // ─── Cleanup ───
  useEffect(() => {
    const handleUnload = () => {
      flushGA();
      flushFunnel();
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      if (gaTimerRef.current) clearTimeout(gaTimerRef.current);
      if (funnelTimerRef.current) clearTimeout(funnelTimerRef.current);
      flushFunnel();
    };
  }, [flushGA, flushFunnel]);

  return {
    // GA4 core
    trackEvent,
    trackPageView,
    // Game tracking
    trackGameStart,
    trackGameEnd,
    trackCorrectGuess,
    trackIncorrectGuess,
    trackAchievementUnlocked,
    trackSocialShare,
    trackSignupStart,
    trackSignupComplete,
    trackDifficultyChange,
    trackSessionDuration,
    // Enhanced
    trackPlayerGuess,
    trackGameSession,
    trackUserEngagement,
    trackFeatureUsage,
    trackPerformanceMetric,
    // Funnel
    trackFunnelStep,
    trackFunnelPageView,
    trackGameModeClick,
    trackFunnelGameStart,
    trackFirstGuess,
    trackGuessResult,
    trackGameCompleted,
    trackRankingSaveShown,
    trackRankingSaved,
    trackShareShown,
    trackShareCompleted,
    trackAuthPromptShown,
    trackAuthStarted,
    trackAuthCompleted,
    trackPlayAgain,
    sessionId: sessionId.current,
  };
};
