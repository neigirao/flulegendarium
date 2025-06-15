
import { useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ObservabilityMetrics {
  // Performance metrics
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  // Business metrics
  gameStarted?: boolean;
  gameCompleted?: boolean;
  playerGuessed?: string;
  correctGuess?: boolean;
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const useObservability = () => {
  const { toast } = useToast();

  // Structured logger
  const log = useCallback((level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>) => {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };

    // Console output with structured format
    const logMethod = console[level] || console.log;
    logMethod(`🔍 [${level.toUpperCase()}] ${message}`, logEntry);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'app_log', {
        event_category: 'Observability',
        event_label: level,
        custom_map: { message, context: JSON.stringify(context) }
      });
    }
  }, []);

  // Performance tracking
  const trackPerformance = useCallback((metric: string, value: number, context?: Record<string, any>) => {
    log('info', `Performance: ${metric}`, { metric, value, ...context });

    // Track performance alerts
    const thresholds = {
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1
      fcp: 1800, // 1.8s
      ttfb: 800  // 800ms
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (threshold && value > threshold) {
      log('warn', `Performance threshold exceeded: ${metric}`, { 
        value, 
        threshold, 
        exceeded_by: value - threshold 
      });
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: metric,
        value: Math.round(value)
      });
    }
  }, [log]);

  // Business metrics tracking
  const trackBusinessMetric = useCallback((event: string, data?: Record<string, any>) => {
    log('info', `Business Event: ${event}`, data);

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'Business',
        ...data
      });
    }
  }, [log]);

  // Error tracking with context
  const trackError = useCallback((error: Error | string, context?: ErrorContext) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const errorContext = {
      message: errorMessage,
      stack: errorStack,
      severity: context?.severity || 'medium',
      component: context?.component,
      action: context?.action,
      userId: context?.userId,
      timestamp: new Date().toISOString()
    };

    log('error', `Error: ${errorMessage}`, errorContext);

    // Show toast for high severity errors
    if (context?.severity === 'high' || context?.severity === 'critical') {
      toast({
        variant: "destructive",
        title: "Erro detectado",
        description: "Nosso time foi notificado e está trabalhando na correção.",
      });
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'app_error', {
        event_category: 'Error',
        event_label: context?.severity || 'medium',
        value: 1
      });
    }
  }, [log, toast]);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          trackPerformance('lcp', lastEntry.startTime);
        }
      });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          trackPerformance('fid', fid);
        });
      });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            trackPerformance('cls', clsValue);
          }
        });
      });

      // Try to observe, with fallbacks
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        log('warn', 'LCP observation not supported');
      }

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        log('warn', 'FID observation not supported');
      }

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        log('warn', 'CLS observation not supported');
      }

      // Cleanup
      return () => {
        try {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        } catch (e) {
          log('warn', 'Error disconnecting performance observers');
        }
      };
    } catch (error) {
      log('error', 'Failed to initialize performance monitoring', { error });
    }
  }, [trackPerformance, log]);

  // Monitor page load performance
  useEffect(() => {
    const handleLoad = () => {
      try {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (perfData) {
          trackPerformance('ttfb', perfData.responseStart - perfData.requestStart);
          trackPerformance('dom_complete', perfData.domComplete - perfData.fetchStart);
          trackPerformance('load_complete', perfData.loadEventEnd - perfData.fetchStart);
        }
      } catch (error) {
        log('warn', 'Failed to collect navigation timing', { error });
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [trackPerformance, log]);

  return {
    log,
    trackPerformance,
    trackBusinessMetric,
    trackError
  };
};
