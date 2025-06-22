
// Global type declarations for the application

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    __vitePreload?: (moduleId: string, ...args: any[]) => Promise<any>;
    scheduler?: {
      postTask: (callback: () => void, options?: { priority: 'background' | 'user-blocking' | 'user-visible' }) => void;
    };
  }

  // Extend Performance API
  interface Performance {
    measureUserAgentSpecificMemory?: () => Promise<{
      bytes: number;
      breakdown: Array<{
        bytes: number;
        attribution: any[];
        types: string[];
      }>;
    }>;
  }
}

// Tipos para analytics e tracking
export interface AnalyticsEvent {
  event_category: string;
  event_label?: string;
  value?: number;
}

// Tipos para performance
export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

// Tipos para erros
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
}

export {};
