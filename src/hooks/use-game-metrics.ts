
import { useCallback } from 'react';
import { useObservability } from './use-observability';

interface GameSession {
  sessionId: string;
  startTime: number;
  isAuthenticated: boolean;
  playerName?: string;
}

interface GameMetrics {
  sessionDuration: number;
  totalGuesses: number;
  correctGuesses: number;
  accuracy: number;
  abandonmentPoint?: 'tutorial' | 'name_form' | 'gameplay' | 'completed';
}

export const useGameMetrics = () => {
  const { trackBusinessMetric, log } = useObservability();

  const trackGameStart = useCallback((sessionData: Partial<GameSession>) => {
    const startTime = Date.now();
    
    trackBusinessMetric('game_started', {
      session_id: sessionData.sessionId,
      is_authenticated: sessionData.isAuthenticated,
      has_player_name: !!sessionData.playerName,
      start_time: startTime
    });

    log('info', 'Game session started', sessionData);
  }, [trackBusinessMetric, log]);

  const trackGameEnd = useCallback((sessionData: GameSession, metrics: GameMetrics) => {
    const endTime = Date.now();
    const sessionDuration = endTime - sessionData.startTime;

    trackBusinessMetric('game_completed', {
      session_id: sessionData.sessionId,
      session_duration: sessionDuration,
      total_guesses: metrics.totalGuesses,
      correct_guesses: metrics.correctGuesses,
      accuracy: metrics.accuracy,
      is_authenticated: sessionData.isAuthenticated,
      player_name: sessionData.playerName
    });

    log('info', 'Game session completed', { sessionData, metrics, sessionDuration });
  }, [trackBusinessMetric, log]);

  const trackPlayerGuess = useCallback((playerName: string, guess: string, isCorrect: boolean, timeToGuess: number) => {
    trackBusinessMetric('player_guess', {
      target_player: playerName,
      user_guess: guess,
      is_correct: isCorrect,
      time_to_guess: timeToGuess,
      difficulty_score: playerName.length // Simple difficulty measure
    });

    log('info', `Player guess: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`, {
      playerName,
      guess,
      timeToGuess
    });
  }, [trackBusinessMetric, log]);

  const trackGameAbandonment = useCallback((sessionData: GameSession, abandonmentPoint: GameMetrics['abandonmentPoint']) => {
    const abandonmentTime = Date.now();
    const timeSpent = abandonmentTime - sessionData.startTime;

    trackBusinessMetric('game_abandoned', {
      session_id: sessionData.sessionId,
      abandonment_point: abandonmentPoint,
      time_spent: timeSpent,
      is_authenticated: sessionData.isAuthenticated
    });

    log('warn', `Game abandoned at: ${abandonmentPoint}`, { sessionData, timeSpent });
  }, [trackBusinessMetric, log]);

  const trackConversion = useCallback((fromGuest: boolean, method: 'signup' | 'login') => {
    if (fromGuest) {
      trackBusinessMetric('guest_conversion', {
        conversion_method: method,
        conversion_time: Date.now()
      });

      log('info', `Guest converted via ${method}`, { method });
    }
  }, [trackBusinessMetric, log]);

  const trackSocialShare = useCallback((platform: string, score: number, isAuthenticated: boolean) => {
    trackBusinessMetric('social_share', {
      platform,
      score,
      is_authenticated: isAuthenticated,
      share_time: Date.now()
    });

    log('info', `Social share: ${platform}`, { score, isAuthenticated });
  }, [trackBusinessMetric, log]);

  return {
    trackGameStart,
    trackGameEnd,
    trackPlayerGuess,
    trackGameAbandonment,
    trackConversion,
    trackSocialShare
  };
};
