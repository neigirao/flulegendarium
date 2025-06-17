
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useObservability } from './use-observability';

interface UserSessionData {
  session_id: string;
  user_id: string;
  start_time: number;
  page_views: number;
  total_time_spent: number;
  device_info: {
    type: 'mobile' | 'desktop' | 'tablet';
    screen_width: number;
    screen_height: number;
    user_agent: string;
  };
  interaction_events: number;
  navigation_patterns: string[];
  hesitation_moments: Array<{
    timestamp: number;
    element: string;
    duration: number;
  }>;
}

interface UserBehavioralProfile {
  user_id: string;
  preferred_play_times: string[];
  average_session_duration: number;
  game_completion_rate: number;
  help_seeking_frequency: number;
  learning_progression_score: number;
  engagement_level: 'low' | 'medium' | 'high' | 'very_high';
  churn_risk_score: number;
  player_type_preferences: string[];
}

export const useAdvancedUserTracking = () => {
  const { user } = useAuth();
  const { trackBusinessMetric, log } = useObservability();
  const sessionDataRef = useRef<UserSessionData | null>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageStartTimeRef = useRef<number>(Date.now());

  // Initialize session tracking
  const initializeSession = useCallback(() => {
    if (!user) return;

    const sessionId = `session_${user.id}_${Date.now()}`;
    
    // Fix the type casting issue
    const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
      if (window.innerWidth < 768) return 'mobile';
      if (window.innerWidth < 1024) return 'tablet';
      return 'desktop';
    };

    const deviceInfo = {
      type: getDeviceType(),
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      user_agent: navigator.userAgent
    };

    sessionDataRef.current = {
      session_id: sessionId,
      user_id: user.id,
      start_time: Date.now(),
      page_views: 1,
      total_time_spent: 0,
      device_info: deviceInfo,
      interaction_events: 0,
      navigation_patterns: [window.location.pathname],
      hesitation_moments: []
    };

    log('info', 'Advanced user session initialized', { sessionId, deviceInfo });
  }, [user, log]);

  // Track page view with detailed metadata
  const trackPageView = useCallback((path: string) => {
    if (!sessionDataRef.current) return;

    const timeSpent = Date.now() - pageStartTimeRef.current;
    sessionDataRef.current.page_views += 1;
    sessionDataRef.current.total_time_spent += timeSpent;
    sessionDataRef.current.navigation_patterns.push(path);

    trackBusinessMetric('enhanced_page_view', {
      user_id: sessionDataRef.current.user_id,
      path,
      time_spent: timeSpent,
      session_id: sessionDataRef.current.session_id,
      device_type: sessionDataRef.current.device_info.type,
      page_sequence: sessionDataRef.current.page_views
    });

    pageStartTimeRef.current = Date.now();
    log('info', 'Enhanced page view tracked', { path, timeSpent });
  }, [trackBusinessMetric, log]);

  // Track user interactions with UI elements
  const trackInteraction = useCallback((element: string, action: string, metadata?: Record<string, any>) => {
    if (!sessionDataRef.current) return;

    sessionDataRef.current.interaction_events += 1;

    trackBusinessMetric('ui_interaction', {
      user_id: sessionDataRef.current.user_id,
      element,
      action,
      session_id: sessionDataRef.current.session_id,
      timestamp: Date.now(),
      device_type: sessionDataRef.current.device_info.type,
      ...metadata
    });

    log('info', 'User interaction tracked', { element, action, metadata });
  }, [trackBusinessMetric, log]);

  // Track hesitation moments (when user hovers/focuses but doesn't act)
  const trackHesitation = useCallback((element: string, duration: number) => {
    if (!sessionDataRef.current || duration < 2000) return; // Only track hesitation > 2s

    const hesitationEvent = {
      timestamp: Date.now(),
      element,
      duration
    };

    sessionDataRef.current.hesitation_moments.push(hesitationEvent);

    trackBusinessMetric('user_hesitation', {
      user_id: sessionDataRef.current.user_id,
      element,
      duration,
      session_id: sessionDataRef.current.session_id,
      hesitation_count: sessionDataRef.current.hesitation_moments.length
    });

    log('warn', 'User hesitation detected', hesitationEvent);
  }, [trackBusinessMetric, log]);

  // Calculate and save behavioral profile
  const saveBehavioralProfile = useCallback(async () => {
    if (!user || !sessionDataRef.current) return;

    try {
      const currentHour = new Date().getHours();
      const sessionDuration = Date.now() - sessionDataRef.current.start_time;
      
      // Calculate engagement level based on interactions and time spent
      const interactionRate = sessionDataRef.current.interaction_events / (sessionDuration / 60000); // per minute
      let engagementLevel: UserBehavioralProfile['engagement_level'] = 'low';
      
      if (interactionRate > 10) engagementLevel = 'very_high';
      else if (interactionRate > 5) engagementLevel = 'high';
      else if (interactionRate > 2) engagementLevel = 'medium';

      // Calculate churn risk (simplified algorithm)
      const hesitationRate = sessionDataRef.current.hesitation_moments.length / sessionDataRef.current.page_views;
      const churnRiskScore = Math.min(100, hesitationRate * 20 + (sessionDuration < 30000 ? 50 : 0));

      const profile: Partial<UserBehavioralProfile> = {
        user_id: user.id,
        preferred_play_times: [`${currentHour}:00`],
        average_session_duration: sessionDuration,
        engagement_level: engagementLevel,
        churn_risk_score: churnRiskScore,
        help_seeking_frequency: sessionDataRef.current.hesitation_moments.length
      };

      // Save to database
      const { error } = await supabase
        .from('user_behavioral_profiles')
        .upsert(profile, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving behavioral profile:', error);
      } else {
        log('info', 'Behavioral profile saved', profile);
      }
    } catch (error) {
      console.error('Error calculating behavioral profile:', error);
    }
  }, [user, log]);

  // Track game-specific events with enhanced metadata
  const trackGameEvent = useCallback((event: string, data: Record<string, any>) => {
    if (!user) return;

    const enhancedData = {
      ...data,
      user_id: user.id,
      session_id: sessionDataRef.current?.session_id,
      device_type: sessionDataRef.current?.device_info.type,
      timestamp: Date.now(),
      page_context: window.location.pathname,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    };

    trackBusinessMetric(`game_${event}`, enhancedData);
    log('info', `Game event: ${event}`, enhancedData);
  }, [user, trackBusinessMetric, log]);

  // Initialize session on mount and cleanup on unmount
  useEffect(() => {
    if (user) {
      initializeSession();
    }

    return () => {
      if (sessionDataRef.current) {
        saveBehavioralProfile();
      }
    };
  }, [user, initializeSession, saveBehavioralProfile]);

  // Auto-save session data periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (sessionDataRef.current) {
        sessionDataRef.current.total_time_spent = Date.now() - sessionDataRef.current.start_time;
        saveBehavioralProfile();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [user, saveBehavioralProfile]);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [trackPageView]);

  return {
    trackPageView,
    trackInteraction,
    trackHesitation,
    trackGameEvent,
    sessionData: sessionDataRef.current
  };
};
