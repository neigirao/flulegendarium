import * as Sentry from '@sentry/react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Add testSentry to window for manual testing
declare global {
  interface Window {
    testSentry: () => void;
  }
}

// Initialize Sentry as early as possible in your application's lifecycle
export const initializeSentry = () => {
  Sentry.init({
    dsn: "https://f9c46da6b7626a7ae61c9b0e87f46eba@o4509675988385792.ingest.us.sentry.io/4509676034392064",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.supabase\.co\//, /^https:\/\/api\./],
    
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    
    // Environment
    environment: import.meta.env.MODE,
  });
  
  // Track Core Web Vitals
  onCLS((metric) => {
    Sentry.setMeasurement('CLS', metric.value, 'number');
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `CLS: ${metric.value}`,
      level: 'info',
      data: metric,
    });
  });

  onINP((metric) => {
    Sentry.setMeasurement('INP', metric.value, 'millisecond');
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `INP: ${metric.value}ms`,
      level: 'info',
      data: metric,
    });
  });

  onFCP((metric) => {
    Sentry.setMeasurement('FCP', metric.value, 'millisecond');
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `FCP: ${metric.value}ms`,
      level: 'info',
      data: metric,
    });
  });

  onLCP((metric) => {
    Sentry.setMeasurement('LCP', metric.value, 'millisecond');
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `LCP: ${metric.value}ms`,
      level: 'info',
      data: metric,
    });
  });

  onTTFB((metric) => {
    Sentry.setMeasurement('TTFB', metric.value, 'millisecond');
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `TTFB: ${metric.value}ms`,
      level: 'info',
      data: metric,
    });
  });
  
  // Track memory usage
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    Sentry.setTag('memory.used', Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024));
    Sentry.setTag('memory.total', Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024));
  }
  
  // Test if Sentry is working
  console.log('Sentry initialized successfully');
  
  // Add a way to manually test Sentry
  window.testSentry = () => {
    try {
      throw new Error("Manual Sentry test error!");
    } catch (error) {
      Sentry.captureException(error);
      console.log('Test error sent to Sentry');
    }
  };
};

// Custom error boundary for Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance measurement utilities
export const measurePerformance = {
  startTransaction: (name: string, op: string = 'navigation') => {
    return Sentry.startSpan({ name, op }, () => {});
  },
  
  measureFunction: <T extends (...args: any[]) => any>(
    fn: T, 
    name: string,
    op: string = 'function'
  ): T => {
    return ((...args: any[]) => {
      return Sentry.startSpan({ name, op }, () => {
        try {
          const result = fn(...args);
          
          // Handle async functions
          if (result instanceof Promise) {
            return result
              .then(value => {
                return value;
              })
              .catch(error => {
                Sentry.captureException(error);
                throw error;
              });
          }
          
          return result;
        } catch (error) {
          Sentry.captureException(error);
          throw error;
        }
      });
    }) as T;
  },
  
  // Game-specific performance tracking
  trackGamePerformance: (gameMode: string, action: string, duration?: number) => {
    Sentry.addBreadcrumb({
      category: 'game',
      message: `${gameMode}: ${action}`,
      level: 'info',
      data: {
        gameMode,
        action,
        duration
      }
    });
    
    if (duration) {
      Sentry.setTag('game.lastAction', action);
      Sentry.setContext('game', {
        mode: gameMode,
        lastAction: action,
        duration
      });
    }
  }
};

// User feedback integration
export const captureUserFeedback = (feedback: {
  name: string;
  email: string;
  message: string;
}) => {
  const eventId = Sentry.captureMessage('User Feedback', 'info');
  
  Sentry.captureFeedback({
    name: feedback.name,
    email: feedback.email,
    message: feedback.message,
    associatedEventId: eventId
  });
};

export { Sentry };