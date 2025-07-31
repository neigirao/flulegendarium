import { Database } from '@/integrations/supabase/types';

declare global {
  type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
  type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

  // Google Analytics gtag types
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'exception' | 'page_view' | 'purchase' | 'refund' | 'select_content' | 'share' | 'sign_up' | 'timing_complete' | 'custom',
      targetId: string,
      config?: any
    ) => void;
    dataLayer?: any[];
  }

  // Declare gtag as global function
  declare function gtag(
    command: 'config' | 'event' | 'exception' | 'page_view' | 'purchase' | 'refund' | 'select_content' | 'share' | 'sign_up' | 'timing_complete' | 'custom',
    targetId: string,
    config?: any
  ): void;

  // Scheduler API types
  interface Scheduler {
    postTask(callback: () => void, options?: { priority?: 'user-blocking' | 'user-visible' | 'background' }): Promise<void>;
  }

  interface Window {
    scheduler?: Scheduler;
  }

  // Web Vitals types
  interface PerformanceNavigationTiming extends PerformanceEntry {
    fetchStart: number;
    responseStart: number;
    responseEnd: number;
  }

  // Layout shift entry type
  interface LayoutShiftEntry extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }
}

export {};