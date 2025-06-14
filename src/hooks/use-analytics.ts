
import { useEffect } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Optimized analytics with performance considerations
export const useAnalytics = () => {
  // Queue events to batch send them
  const eventQueue: AnalyticsEvent[] = [];
  let batchTimer: NodeJS.Timeout | null = null;
  
  const flushEvents = () => {
    if (eventQueue.length === 0) return;
    
    // Send batched events
    eventQueue.forEach(event => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      }
    });
    
    // Clear queue
    eventQueue.length = 0;
  };
  
  const trackEvent = ({ action, category, label, value }: AnalyticsEvent) => {
    // Add to queue instead of sending immediately
    eventQueue.push({ action, category, label, value });
    
    // Batch events every 2 seconds
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(flushEvents, 2000);
    
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event Queued:', { action, category, label, value });
    }
  };
  
  // Flush events on page unload
  useEffect(() => {
    const handleUnload = () => {
      flushEvents();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (batchTimer) clearTimeout(batchTimer);
    };
  }, []);

  const trackPageView = (page: string) => {
    // Use requestIdleCallback for non-critical analytics
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-X2VE77MEYC', {
            page_path: page,
          });
        }
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', 'G-X2VE77MEYC', {
            page_path: page,
          });
        }
      }, 100);
    }
  };

  const trackGameStart = (mode: string) => {
    trackEvent({
      action: 'game_start',
      category: 'Game',
      label: mode,
    });
  };

  const trackGameEnd = (score: number, correctGuesses: number) => {
    trackEvent({
      action: 'game_end',
      category: 'Game',
      label: 'score',
      value: score,
    });
    
    trackEvent({
      action: 'game_end',
      category: 'Game',
      label: 'correct_guesses',
      value: correctGuesses,
    });
  };

  const trackCorrectGuess = (playerName: string) => {
    trackEvent({
      action: 'correct_guess',
      category: 'Game',
      label: playerName,
    });
  };

  const trackIncorrectGuess = (playerName: string, userGuess: string) => {
    trackEvent({
      action: 'incorrect_guess',
      category: 'Game',
      label: `${playerName} - guessed: ${userGuess}`,
    });
  };

  const trackAchievementUnlocked = (achievementName: string) => {
    trackEvent({
      action: 'achievement_unlocked',
      category: 'Achievements',
      label: achievementName,
    });
  };

  const trackSocialShare = (platform: string, score: number) => {
    trackEvent({
      action: 'social_share',
      category: 'Social',
      label: platform,
      value: score,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackGameStart,
    trackGameEnd,
    trackCorrectGuess,
    trackIncorrectGuess,
    trackAchievementUnlocked,
    trackSocialShare,
  };
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
