
import { useCallback } from 'react';
import { useGameMetrics } from './use-game-metrics';
import { useAdvancedUserTracking } from './use-advanced-user-tracking';
import { useBehavioralMetrics } from './use-behavioral-metrics';
import { useAuth } from './useAuth';

export const useEnhancedGameMetrics = () => {
  const { user } = useAuth();
  const originalGameMetrics = useGameMetrics();
  const { trackInteraction, trackGameEvent, trackHesitation } = useAdvancedUserTracking();
  const { 
    trackPlayerRecognition, 
    trackLearningProgression, 
    trackEngagementEvent,
    trackConversionEvent 
  } = useBehavioralMetrics();

  // Enhanced game start tracking
  const trackGameStart = useCallback((sessionData: any) => {
    // Original tracking
    originalGameMetrics.trackGameStart(sessionData);
    
    // Enhanced tracking
    trackGameEvent('start', {
      is_returning_user: !!user,
      session_context: sessionData,
      game_mode: 'guess_player'
    });

    trackInteraction('game', 'start', {
      user_type: user ? 'authenticated' : 'guest'
    });

    if (user) {
      trackConversionEvent('game_started');
    }
  }, [originalGameMetrics, trackGameEvent, trackInteraction, trackConversionEvent, user]);

  // Enhanced player guess tracking
  const trackPlayerGuess = useCallback((
    playerName: string, 
    guess: string, 
    isCorrect: boolean, 
    timeToGuess: number,
    previousScore?: number,
    currentScore?: number
  ) => {
    // Original tracking
    originalGameMetrics.trackPlayerGuess(playerName, guess, isCorrect, timeToGuess);
    
    // Enhanced tracking
    trackPlayerRecognition(playerName, timeToGuess, isCorrect);
    
    if (previousScore !== undefined && currentScore !== undefined) {
      trackLearningProgression(previousScore, currentScore);
    }

    trackGameEvent('guess', {
      target_player: playerName,
      user_guess: guess,
      is_correct: isCorrect,
      time_to_guess: timeToGuess,
      difficulty_indicators: {
        quick_guess: timeToGuess < 5000,
        slow_guess: timeToGuess > 30000,
        hesitation_detected: timeToGuess > 15000
      }
    });

    // Track hesitation if guess took too long
    if (timeToGuess > 15000) {
      trackHesitation('player_image', timeToGuess);
    }
  }, [originalGameMetrics, trackPlayerRecognition, trackLearningProgression, trackGameEvent, trackHesitation]);

  // Enhanced game completion tracking
  const trackGameEnd = useCallback((sessionData: any, metrics: any) => {
    // Original tracking
    originalGameMetrics.trackGameEnd(sessionData, metrics);
    
    // Enhanced tracking with detailed performance analysis
    trackGameEvent('complete', {
      ...metrics,
      performance_analysis: {
        average_guess_time: metrics.totalGuesses > 0 ? metrics.sessionDuration / metrics.totalGuesses : 0,
        accuracy_trend: metrics.accuracy > 0.7 ? 'improving' : 'needs_work',
        engagement_level: metrics.sessionDuration > 120000 ? 'high' : 'medium'
      }
    });

    if (user) {
      trackConversionEvent('game_completed');
    }
  }, [originalGameMetrics, trackGameEvent, trackConversionEvent, user]);

  // Enhanced social share tracking
  const trackSocialShare = useCallback((platform: string, score: number, isAuthenticated: boolean) => {
    // Original tracking
    originalGameMetrics.trackSocialShare(platform, score, isAuthenticated);
    
    // Enhanced tracking
    trackEngagementEvent('share');
    trackInteraction('social_share', 'click', {
      platform,
      score,
      share_context: 'game_completion'
    });
  }, [originalGameMetrics, trackEngagementEvent, trackInteraction]);

  // Track replay attempts
  const trackGameReplay = useCallback(() => {
    trackEngagementEvent('replay');
    trackInteraction('game', 'replay', {
      replay_trigger: 'user_initiated'
    });
  }, [trackEngagementEvent, trackInteraction]);

  // Track help usage
  const trackHelpUsage = useCallback((helpType: string) => {
    trackEngagementEvent('help_used');
    trackInteraction('help', 'access', {
      help_type: helpType
    });
  }, [trackEngagementEvent, trackInteraction]);

  // Track tutorial interactions
  const trackTutorialEvent = useCallback((action: 'start' | 'complete' | 'skip') => {
    trackInteraction('tutorial', action);
    trackGameEvent('tutorial', { action });
  }, [trackInteraction, trackGameEvent]);

  return {
    // Enhanced methods
    trackGameStart,
    trackPlayerGuess,
    trackGameEnd,
    trackSocialShare,
    trackGameReplay,
    trackHelpUsage,
    trackTutorialEvent,
    
    // Original methods (for backward compatibility)
    trackGameAbandonment: originalGameMetrics.trackGameAbandonment,
    trackConversion: originalGameMetrics.trackConversion
  };
};
