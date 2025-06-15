
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { captureException, addBreadcrumb, setContext } from '@/services/sentry';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  trackAnalytics?: boolean;
  reportToSentry?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const {
    showToast = true,
    logToConsole = true,
    trackAnalytics = true,
    reportToSentry = true
  } = options;

  const handleError = useCallback((error: Error, context?: string, additionalData?: Record<string, any>) => {
    // Log to console
    if (logToConsole) {
      console.error(`Error in ${context || 'application'}:`, error, additionalData);
    }

    // Add breadcrumb for error context
    if (reportToSentry) {
      addBreadcrumb({
        message: `Error occurred in ${context || 'unknown context'}`,
        data: {
          errorMessage: error.message,
          errorStack: error.stack,
          ...additionalData
        },
        level: 'error'
      });

      // Set additional context
      if (additionalData) {
        setContext('errorContext', {
          context,
          timestamp: new Date().toISOString(),
          ...additionalData
        });
      }

      // Capture exception in Sentry
      captureException(error);
    }

    // Show toast notification
    if (showToast) {
      toast({
        variant: "destructive",
        title: "Ops! Algo deu errado",
        description: "Tente novamente. Se o problema persistir, entre em contato conosco.",
      });
    }

    // Track analytics
    if (trackAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'javascript_error', {
        error_message: error.message,
        error_context: context || 'unknown',
        error_stack: error.stack
      });
    }
  }, [toast, showToast, logToConsole, trackAnalytics, reportToSentry]);

  const handleGameError = useCallback((error: Error, gameState?: Record<string, any>) => {
    handleError(error, 'game', {
      gameState,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  }, [handleError]);

  const handleNetworkError = useCallback((error: Error, url?: string, method?: string) => {
    handleError(error, 'network', {
      url,
      method,
      networkStatus: navigator.onLine ? 'online' : 'offline'
    });
  }, [handleError]);

  return { 
    handleError, 
    handleGameError, 
    handleNetworkError 
  };
};
