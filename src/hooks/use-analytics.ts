import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Optimized analytics with performance considerations
export const useAnalytics = () => {
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const flushEvents = useCallback(() => {
    const queue = eventQueueRef.current;
    if (queue.length === 0) return;
    
    // Send batched events
    queue.forEach(event => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      }
    });
    
    // Clear queue
    eventQueueRef.current = [];
  }, []);
  
  const trackEvent = useCallback(({ action, category, label, value }: AnalyticsEvent) => {
    // Add to queue instead of sending immediately
    eventQueueRef.current.push({ action, category, label, value });
    
    // Batch events every 2 seconds
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    batchTimerRef.current = setTimeout(flushEvents, 2000);
    
    // Log for development
    logger.debug('Analytics Event Queued', 'ANALYTICS', { action, category, label, value });
  }, [flushEvents]);
  
  // Flush events on page unload
  useEffect(() => {
    const handleUnload = () => {
      flushEvents();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    };
  }, [flushEvents]);

  const trackPageView = useCallback((page: string) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-X2VE77MEYC', {
            page_path: page,
          });
        }
      });
    } else {
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-X2VE77MEYC', {
            page_path: page,
          });
        }
      }, 100);
    }
  }, []);

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

  return {
    trackEvent,
    trackPageView,
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
  };
};
