import * as Sentry from '@sentry/react';

// Add testSentry to window for manual testing
declare global {
  interface Window {
    testSentry: () => void;
  }
}

// Initialize Sentry with configuration from Supabase
export const initializeSentry = async () => {
  try {
    // Get Sentry config from edge function
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('get-sentry-config');
    
    if (error || !data?.dsn) {
      console.warn('Failed to get Sentry config, using fallback:', error);
      // Fallback to hardcoded DSN
      Sentry.init({
        dsn: "https://f9c46da6b7626a7ae61c9b0e87f46eba@o4509675988385792.ingest.us.sentry.io/4509676034392064",
        sendDefaultPii: true,
        debug: true
      });
    } else {
      Sentry.init({
        dsn: data.dsn,
        environment: data.environment || 'production',
        sendDefaultPii: true,
        debug: true
      });
    }
  } catch (err) {
    console.error('Error initializing Sentry:', err);
    // Fallback initialization
    Sentry.init({
      dsn: "https://f9c46da6b7626a7ae61c9b0e87f46eba@o4509675988385792.ingest.us.sentry.io/4509676034392064",
      sendDefaultPii: true,
      debug: true
    });
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