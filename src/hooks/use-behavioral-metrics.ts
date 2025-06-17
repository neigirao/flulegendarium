
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GameBehaviorMetrics {
  user_id: string;
  session_id: string;
  player_recognition_patterns: {
    quick_recognitions: string[]; // Players recognized in < 5s
    slow_recognitions: string[]; // Players taking > 30s
    failed_recognitions: string[]; // Players that caused game over
  };
  learning_indicators: {
    improvement_over_time: boolean;
    mistake_repetition_rate: number;
    help_usage_frequency: number;
  };
  engagement_signals: {
    replay_frequency: number;
    share_attempts: number;
    time_between_sessions: number;
    preferred_game_times: string[];
  };
  user_journey_data: {
    entry_point: string;
    referrer: string;
    utm_parameters: Record<string, string>;
    conversion_events: string[];
  };
}

export const useBehavioralMetrics = () => {
  const { user } = useAuth();
  const metricsRef = useRef<Partial<GameBehaviorMetrics>>({});
  const lastGameSessionRef = useRef<number>(0);

  // Initialize metrics tracking
  const initializeMetrics = useCallback(() => {
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || ''
    };

    metricsRef.current = {
      user_id: user.id,
      session_id: `session_${user.id}_${Date.now()}`,
      player_recognition_patterns: {
        quick_recognitions: [],
        slow_recognitions: [],
        failed_recognitions: []
      },
      learning_indicators: {
        improvement_over_time: false,
        mistake_repetition_rate: 0,
        help_usage_frequency: 0
      },
      engagement_signals: {
        replay_frequency: 0,
        share_attempts: 0,
        time_between_sessions: Date.now() - lastGameSessionRef.current,
        preferred_game_times: []
      },
      user_journey_data: {
        entry_point: window.location.pathname,
        referrer: document.referrer,
        utm_parameters: utmParams,
        conversion_events: []
      }
    };

    console.log('🎯 Behavioral metrics initialized', metricsRef.current);
  }, [user]);

  // Track player recognition performance
  const trackPlayerRecognition = useCallback((playerName: string, timeToGuess: number, isCorrect: boolean) => {
    if (!metricsRef.current.player_recognition_patterns) return;

    if (isCorrect) {
      if (timeToGuess < 5000) {
        metricsRef.current.player_recognition_patterns.quick_recognitions.push(playerName);
      } else if (timeToGuess > 30000) {
        metricsRef.current.player_recognition_patterns.slow_recognitions.push(playerName);
      }
    } else {
      metricsRef.current.player_recognition_patterns.failed_recognitions.push(playerName);
    }

    console.log('👤 Player recognition tracked', { playerName, timeToGuess, isCorrect });
  }, []);

  // Track learning progression
  const trackLearningProgression = useCallback((previousScore: number, currentScore: number) => {
    if (!metricsRef.current.learning_indicators) return;

    metricsRef.current.learning_indicators.improvement_over_time = currentScore > previousScore;
    
    // Calculate mistake repetition rate
    const failedPlayers = metricsRef.current.player_recognition_patterns?.failed_recognitions || [];
    const uniqueFailures = new Set(failedPlayers).size;
    metricsRef.current.learning_indicators.mistake_repetition_rate = 
      failedPlayers.length > 0 ? (failedPlayers.length - uniqueFailures) / failedPlayers.length : 0;

    console.log('📈 Learning progression tracked', metricsRef.current.learning_indicators);
  }, []);

  // Track engagement events
  const trackEngagementEvent = useCallback((event: 'replay' | 'share' | 'help_used') => {
    if (!metricsRef.current.engagement_signals && !metricsRef.current.learning_indicators) return;

    switch (event) {
      case 'replay':
        metricsRef.current.engagement_signals!.replay_frequency += 1;
        break;
      case 'share':
        metricsRef.current.engagement_signals!.share_attempts += 1;
        break;
      case 'help_used':
        metricsRef.current.learning_indicators!.help_usage_frequency += 1;
        break;
    }

    console.log('🔥 Engagement event tracked', { event, metrics: metricsRef.current });
  }, []);

  // Track conversion events (signup, first game, etc.)
  const trackConversionEvent = useCallback((event: string) => {
    if (!metricsRef.current.user_journey_data) return;

    metricsRef.current.user_journey_data.conversion_events.push(event);
    console.log('💫 Conversion event tracked', { event });
  }, []);

  // Save behavioral metrics to database
  const saveBehavioralMetrics = useCallback(async () => {
    if (!user || !metricsRef.current) return;

    try {
      const { error } = await supabase
        .from('user_behavioral_metrics')
        .insert({
          user_id: user.id,
          session_id: metricsRef.current.session_id,
          metrics_data: metricsRef.current,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving behavioral metrics:', error);
      } else {
        console.log('✅ Behavioral metrics saved successfully');
      }
    } catch (error) {
      console.error('❌ Error saving behavioral metrics:', error);
    }
  }, [user]);

  // Get preferred play times
  const getPreferredPlayTimes = useCallback(() => {
    const currentHour = new Date().getHours();
    const timeSlot = `${currentHour}:00-${currentHour + 1}:00`;
    
    if (metricsRef.current.engagement_signals) {
      metricsRef.current.engagement_signals.preferred_game_times.push(timeSlot);
    }
    
    return timeSlot;
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeMetrics();
    }
  }, [user, initializeMetrics]);

  // Save metrics on unmount
  useEffect(() => {
    return () => {
      if (user && metricsRef.current) {
        saveBehavioralMetrics();
      }
    };
  }, [user, saveBehavioralMetrics]);

  // Update last session time
  useEffect(() => {
    lastGameSessionRef.current = Date.now();
  }, []);

  return {
    trackPlayerRecognition,
    trackLearningProgression,
    trackEngagementEvent,
    trackConversionEvent,
    getPreferredPlayTimes,
    saveBehavioralMetrics,
    currentMetrics: metricsRef.current
  };
};
