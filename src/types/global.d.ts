
// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Performance API extensions
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

export {};
