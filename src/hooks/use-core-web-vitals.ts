
import { useEffect, useCallback, useRef } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitalsThresholds {
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  FCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

const THRESHOLDS: WebVitalsThresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

export const useCoreWebVitals = () => {
  const observersRef = useRef<PerformanceObserver[]>([]);
  
  const getRating = (name: keyof WebVitalsThresholds, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = THRESHOLDS[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const reportMetric = useCallback((metric: WebVitalsMetric) => {
    const rating = getRating(metric.name as keyof WebVitalsThresholds, metric.value);
    const enhancedMetric = { ...metric, rating };
    
    console.log(`📊 Core Web Vital - ${metric.name}:`, {
      value: Math.round(metric.value),
      rating,
      id: metric.id
    });
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: { 
          metric_id: metric.id,
          metric_rating: rating
        }
      });
    }

    // Store in session storage for debugging
    try {
      const existingMetrics = JSON.parse(sessionStorage.getItem('web_vitals') || '[]');
      existingMetrics.push(enhancedMetric);
      sessionStorage.setItem('web_vitals', JSON.stringify(existingMetrics.slice(-10))); // Keep last 10
    } catch (error) {
      console.warn('Failed to store web vitals:', error);
    }
  }, []);

  const cleanupObservers = useCallback(() => {
    observersRef.current.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    observersRef.current = [];
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    const measureWebVitals = () => {
      try {
        // LCP - Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            reportMetric({
              name: 'LCP',
              value: lastEntry.startTime,
              delta: lastEntry.startTime,
              id: `lcp-${Date.now()}`
            });
          }
        });

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          observersRef.current.push(lcpObserver);
        } catch (e) {
          console.warn('LCP not supported');
        }

        // FID - First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            reportMetric({
              name: 'FID',
              value: fid,
              delta: fid,
              id: `fid-${Date.now()}`
            });
          });
        });

        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
          observersRef.current.push(fidObserver);
        } catch (e) {
          console.warn('FID not supported');
        }

        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              reportMetric({
                name: 'CLS',
                value: clsValue,
                delta: entry.value,
                id: `cls-${Date.now()}`
              });
            }
          });
        });

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          observersRef.current.push(clsObserver);
        } catch (e) {
          console.warn('CLS not supported');
        }

        // FCP - First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            reportMetric({
              name: 'FCP',
              value: fcpEntry.startTime,
              delta: fcpEntry.startTime,
              id: `fcp-${Date.now()}`
            });
          }
        });

        try {
          fcpObserver.observe({ entryTypes: ['paint'] });
          observersRef.current.push(fcpObserver);
        } catch (e) {
          console.warn('FCP not supported');
        }

        // TTFB - Time to First Byte
        const measureTTFB = () => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            const ttfb = perfData.responseStart - perfData.requestStart;
            reportMetric({
              name: 'TTFB',
              value: ttfb,
              delta: ttfb,
              id: `ttfb-${Date.now()}`
            });
          }
        };

        if (document.readyState === 'complete') {
          measureTTFB();
        } else {
          window.addEventListener('load', measureTTFB, { once: true });
        }

      } catch (error) {
        console.warn('Web Vitals measurement failed:', error);
      }
    };

    // Start measuring after a brief delay to avoid blocking critical rendering
    const timeoutId = setTimeout(measureWebVitals, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanupObservers();
    };
  }, [reportMetric, cleanupObservers]);

  // Expose debug method
  const getStoredMetrics = useCallback(() => {
    try {
      return JSON.parse(sessionStorage.getItem('web_vitals') || '[]');
    } catch {
      return [];
    }
  }, []);

  return { 
    reportMetric, 
    getStoredMetrics,
    thresholds: THRESHOLDS
  };
};
