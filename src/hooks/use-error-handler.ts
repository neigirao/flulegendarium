
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  trackAnalytics?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const {
    showToast = true,
    logToConsole = true,
    trackAnalytics = true
  } = options;

  const handleError = useCallback((error: Error, context?: string) => {
    // Log to console
    if (logToConsole) {
      console.error(`Error in ${context || 'application'}:`, error);
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
  }, [toast, showToast, logToConsole, trackAnalytics]);

  return { handleError };
};
