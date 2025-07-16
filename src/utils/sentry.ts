import * as Sentry from '@sentry/react';

// Initialize Sentry with performance monitoring
export const initializeSentry = async () => {
  try {
    // Fetch Sentry configuration from edge function
    const response = await fetch('https://hafxruwnggitvtyngedy.supabase.co/functions/v1/get-sentry-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch Sentry config, skipping initialization');
      return;
    }

    const config = await response.json();

    Sentry.init({
      dsn: config.dsn,
      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      sendDefaultPii: true,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration()
      ],
      // Enable logging in Sentry
      _experiments: {
        enableLogs: true,
      },
      // Tracing
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "localhost", 
        /^https:\/\/.*\.supabase\.co\//, 
        /^https:\/\/.*\.lovable\.app\//
      ],
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    
    beforeSend(event, hint) {
      // Filter out noisy errors
      if (event.exception) {
        const error = hint.originalException;
        
        // Skip network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          return null;
        }
        
        // Skip ChunkLoadError - these are expected in development
        if (error instanceof Error && error.name === 'ChunkLoadError') {
          return null;
        }
      }
      
      return event;
    },
    
    // Custom tags for better organization
    initialScope: {
      tags: {
        component: 'lendas-do-flu'
      }
    }
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
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