
// Global type definitions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
  
  interface PerformanceEventTiming extends PerformanceEntry {
    processingStart: number;
    processingEnd: number;
  }
}

export {};
