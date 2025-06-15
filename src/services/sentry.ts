
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initializeSentry = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN || "", // User will need to set this
    integrations: [
      new BrowserTracing({
        // Set tracing origins to connect Sentry with your router
        tracePropagationTargets: ["localhost", /^\//],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of the transactions for performance monitoring
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    environment: process.env.NODE_ENV || 'development',
    beforeSend(event) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Event:', event);
      }
      return event;
    },
  });
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setContext = Sentry.setContext;

// Performance monitoring helpers
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};

export const finishTransaction = (transaction: Sentry.Transaction) => {
  transaction.finish();
};
