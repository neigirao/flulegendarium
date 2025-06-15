
import { useCallback, useEffect, useRef } from 'react';
import { captureMessage, setContext, addBreadcrumb } from '@/services/sentry';

interface UXMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  userEngagement: {
    clicksPerSession: number;
    timeOnPage: number;
    scrollDepth: number;
  };
  gameMetrics: {
    averageResponseTime: number;
    completionRate: number;
    errorRate: number;
  };
}

export const useUXMetrics = () => {
  const metricsRef = useRef<Partial<UXMetrics>>({});
  const sessionStartTime = useRef<number>(Date.now());
  const clickCount = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const gameStartTime = useRef<number | null>(null);
  const gameResponses = useRef<number[]>([]);
  const gameErrors = useRef<number>(0);

  // Track page load time
  useEffect(() => {
    const measurePageLoad = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        metricsRef.current.pageLoadTime = pageLoadTime;
        
        // Set performance budget alert
        if (pageLoadTime > 3000) {
          captureMessage(`Performance Budget Exceeded: Page load time ${pageLoadTime}ms`, 'warning');
        }
        
        addBreadcrumb({
          message: 'Page Load Measured',
          data: { pageLoadTime },
          level: 'info'
        });
      }
    };

    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, []);

  // Track Time to Interactive
  useEffect(() => {
    const measureTTI = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              const tti = entry.startTime;
              metricsRef.current.timeToInteractive = tti;
              
              if (tti > 5000) {
                captureMessage(`TTI Performance Budget Exceeded: ${tti}ms`, 'warning');
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
        return () => observer.disconnect();
      }
    };

    return measureTTI();
  }, []);

  // Track user engagement
  useEffect(() => {
    const handleClick = () => {
      clickCount.current += 1;
    };

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercent);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Game-specific metrics
  const trackGameStart = useCallback(() => {
    gameStartTime.current = Date.now();
    gameResponses.current = [];
    gameErrors.current = 0;
    
    addBreadcrumb({
      message: 'Game Started',
      level: 'info'
    });
  }, []);

  const trackGameResponse = useCallback((responseTime: number) => {
    gameResponses.current.push(responseTime);
    
    // Performance budget for game responses
    if (responseTime > 2000) {
      captureMessage(`Slow Game Response: ${responseTime}ms`, 'warning');
    }
  }, []);

  const trackGameError = useCallback((error: string) => {
    gameErrors.current += 1;
    
    addBreadcrumb({
      message: 'Game Error Occurred',
      data: { error },
      level: 'error'
    });
  }, []);

  const trackGameEnd = useCallback((completed: boolean) => {
    if (!gameStartTime.current) return;

    const totalGameTime = Date.now() - gameStartTime.current;
    const averageResponseTime = gameResponses.current.length > 0 
      ? gameResponses.current.reduce((a, b) => a + b, 0) / gameResponses.current.length 
      : 0;
    
    const completionRate = completed ? 1 : 0;
    const errorRate = gameResponses.current.length > 0 
      ? gameErrors.current / gameResponses.current.length 
      : 0;

    metricsRef.current.gameMetrics = {
      averageResponseTime,
      completionRate,
      errorRate
    };

    // Send comprehensive game metrics
    setContext('gameSession', {
      totalTime: totalGameTime,
      averageResponseTime,
      completionRate,
      errorRate,
      totalResponses: gameResponses.current.length,
      totalErrors: gameErrors.current
    });

    addBreadcrumb({
      message: 'Game Session Ended',
      data: {
        completed,
        totalGameTime,
        averageResponseTime,
        errorRate
      },
      level: 'info'
    });
  }, []);

  // Send session metrics on page unload
  useEffect(() => {
    const sendSessionMetrics = () => {
      const sessionDuration = Date.now() - sessionStartTime.current;
      
      const finalMetrics: Partial<UXMetrics> = {
        ...metricsRef.current,
        userEngagement: {
          clicksPerSession: clickCount.current,
          timeOnPage: sessionDuration,
          scrollDepth: maxScrollDepth.current
        }
      };

      setContext('uxMetrics', finalMetrics);
      
      // Check engagement budgets
      if (sessionDuration < 30000) { // Less than 30 seconds
        captureMessage('Low Session Engagement: Short session duration', 'info');
      }
      
      if (clickCount.current < 3) {
        captureMessage('Low Session Engagement: Few interactions', 'info');
      }
    };

    window.addEventListener('beforeunload', sendSessionMetrics);
    return () => window.removeEventListener('beforeunload', sendSessionMetrics);
  }, []);

  return {
    trackGameStart,
    trackGameResponse,
    trackGameError,
    trackGameEnd,
    getCurrentMetrics: () => metricsRef.current
  };
};
