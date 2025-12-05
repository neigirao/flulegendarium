import { useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

// Funnel steps enum
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
  | 'auth_completed';

interface FunnelEvent {
  step: FunnelStep;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

// Session storage for funnel tracking
const FUNNEL_STORAGE_KEY = 'flu_funnel_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const getSessionId = () => {
  const stored = sessionStorage.getItem(FUNNEL_STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    if (Date.now() - data.lastActivity < SESSION_TIMEOUT) {
      return data.sessionId;
    }
  }
  
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify({
    sessionId,
    lastActivity: Date.now()
  }));
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

export const useFunnelAnalytics = () => {
  const eventQueue = useRef<FunnelEvent[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(getSessionId());

  const flushEvents = useCallback(() => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    // Send to Google Analytics
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

    logger.debug('Funnel events flushed', 'ANALYTICS', { count: events.length, events });
  }, []);

  const trackFunnelStep = useCallback((
    step: FunnelStep, 
    metadata?: Record<string, string | number | boolean>
  ) => {
    updateSessionActivity();
    
    const event: FunnelEvent = {
      step,
      timestamp: Date.now(),
      metadata
    };

    eventQueue.current.push(event);
    
    logger.debug('Funnel step tracked', 'ANALYTICS', { step, metadata });

    // Batch events - send after 1 second of inactivity
    if (batchTimer.current) clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(flushEvents, 1000);
  }, [flushEvents]);

  // Flush on unmount or page unload
  useEffect(() => {
    const handleUnload = () => flushEvents();
    
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      if (batchTimer.current) clearTimeout(batchTimer.current);
      flushEvents();
    };
  }, [flushEvents]);

  // Convenience methods for common funnel steps
  const trackPageView = useCallback((page: 'home' | 'game_selection' | 'game') => {
    trackFunnelStep(`page_view_${page}` as FunnelStep);
  }, [trackFunnelStep]);

  const trackGameModeClick = useCallback((mode: string) => {
    trackFunnelStep('game_mode_click', { mode });
  }, [trackFunnelStep]);

  const trackGameStart = useCallback((mode: string, difficulty?: string) => {
    trackFunnelStep('game_started', { mode, difficulty: difficulty || 'unknown' });
  }, [trackFunnelStep]);

  const trackFirstGuess = useCallback((mode: string) => {
    trackFunnelStep('first_guess', { mode });
  }, [trackFunnelStep]);

  const trackGuessResult = useCallback((correct: boolean, attemptNumber: number) => {
    trackFunnelStep(correct ? 'correct_guess' : 'incorrect_guess', { 
      attempt_number: attemptNumber 
    });
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

  return {
    trackFunnelStep,
    trackPageView,
    trackGameModeClick,
    trackGameStart,
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
    sessionId: sessionId.current
  };
};
