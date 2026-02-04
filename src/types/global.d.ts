import { Database } from '@/integrations/supabase/types';

// Type for gtag config values
type GtagConfigValue = string | number | boolean | undefined | null | Record<string, unknown>;
type GtagConfig = Record<string, GtagConfigValue>;

declare global {
  type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
  type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

  // Google Analytics gtag types
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'exception' | 'page_view' | 'purchase' | 'refund' | 'select_content' | 'share' | 'sign_up' | 'timing_complete' | 'custom',
      targetId: string,
      config?: GtagConfig
    ) => void;
    dataLayer?: GtagConfig[];
  }

  // Declare gtag as global function
  declare function gtag(
    command: 'config' | 'event' | 'exception' | 'page_view' | 'purchase' | 'refund' | 'select_content' | 'share' | 'sign_up' | 'timing_complete' | 'custom',
    targetId: string,
    config?: GtagConfig
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
    requestStart: number;
  }

  // Layout shift entry type
  interface LayoutShiftEntry extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }

  // First Input Delay entry type
  interface PerformanceEventTiming extends PerformanceEntry {
    processingStart: number;
    startTime: number;
  }

  // Touch event extensions
  interface Touch {
    clientX: number;
    clientY: number;
  }

  interface TouchEvent extends UIEvent {
    touches: TouchList;
    changedTouches: TouchList;
  }

  // Performance with memory extension
  interface PerformanceWithMemory extends Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
    };
  }

  // Navigator with connection extension
  interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
    msMaxTouchPoints?: number;
  }

  interface NetworkInformation {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }

  // Window with requestIdleCallback
  interface Window {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
    orientation?: number;
  }

  interface IdleRequestCallback {
    (deadline: IdleDeadline): void;
  }

  interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
  }

  interface IdleRequestOptions {
    timeout?: number;
  }
}

export {};