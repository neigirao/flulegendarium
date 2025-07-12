import { useAnalytics } from '@/hooks/use-analytics';
import { useCallback } from 'react';

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

export const useEnhancedAnalytics = () => {
  const analytics = useAnalytics();

  const trackPlayerGuess = useCallback((event: PlayerGuessEvent) => {
    analytics.trackEvent({
      action: event.isCorrect ? 'correct_guess' : 'incorrect_guess',
      category: 'Game',
      label: `${event.playerName} - ${event.gameMode} - ${event.difficulty}`,
      value: Math.round(event.timeToGuess / 1000), // Convert to seconds
    });

    // Track specific performance metrics
    analytics.trackEvent({
      action: 'guess_time',
      category: 'Performance',
      label: event.isCorrect ? 'correct' : 'incorrect',
      value: Math.round(event.timeToGuess / 1000),
    });
  }, [analytics]);

  const trackGameSession = useCallback((event: GameSessionEvent) => {
    analytics.trackEvent({
      action: 'game_session_complete',
      category: 'Game',
      label: event.gameMode,
      value: event.accuracy,
    });

    // Track engagement metrics
    analytics.trackEvent({
      action: 'session_duration',
      category: 'Engagement',
      label: event.gameMode,
      value: Math.round(event.duration / 1000),
    });

    analytics.trackEvent({
      action: 'guess_volume',
      category: 'Engagement',
      label: event.gameMode,
      value: event.totalGuesses,
    });
  }, [analytics]);

  const trackUserEngagement = useCallback((action: string, detail?: string) => {
    analytics.trackEvent({
      action,
      category: 'User_Engagement',
      label: detail,
    });
  }, [analytics]);

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    analytics.trackEvent({
      action,
      category: 'Feature_Usage',
      label: feature,
    });
  }, [analytics]);

  const trackPerformanceMetric = useCallback((metric: string, value: number, label?: string) => {
    analytics.trackEvent({
      action: metric,
      category: 'Performance',
      label,
      value,
    });
  }, [analytics]);

  return {
    ...analytics,
    trackPlayerGuess,
    trackGameSession,
    trackUserEngagement,
    trackFeatureUsage,
    trackPerformanceMetric,
  };
};