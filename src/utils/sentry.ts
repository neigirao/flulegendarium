import * as Sentry from '@sentry/react';
import React from 'react';

// Initialize Sentry with performance monitoring
export const initializeSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE',
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      
      // Session Replay
      replaysSessionSampleRate: 0.01, // 1% of sessions will be recorded
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error will be recorded
      
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