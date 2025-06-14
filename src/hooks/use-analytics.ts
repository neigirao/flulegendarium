
import { useEffect } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const useAnalytics = () => {
  const trackEvent = ({ action, category, label, value }: AnalyticsEvent) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', { action, category, label, value });
    }
  };

  const trackPageView = (page: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-X2VE77MEYC', {
        page_path: page,
      });
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

// Note: Window interface extension is handled in PerformanceMetrics component
