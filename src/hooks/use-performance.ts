
import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export const usePerformance = () => {
  useEffect(() => {
    // Early return if not in browser environment
    if (typeof window === 'undefined') return;

    // Check for Performance Observer support with fallback
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported in this browser');
      return;
    }

    // Web Vitals tracking with error handling
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Track to analytics with fallback
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Performance'
          });
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // First Input Delay (FID) with error handling
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Performance'
            });
          }
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Cumulative Layout Shift (CLS) with error handling
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
        
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Performance'
          });
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }

      // First Contentful Paint (FCP) with error handling
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FCP:', entry.startTime);
          
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              name: 'FCP',
              value: Math.round(entry.startTime),
              event_category: 'Performance'
            });
          }
        });
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observation not supported');
      }

      // Cleanup observers
      return () => {
        try {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          fcpObserver.disconnect();
        } catch (e) {
          console.warn('Error disconnecting performance observers');
        }
      };
    } catch (e) {
      console.warn('Performance monitoring setup failed:', e);
    }
  }, []);

  useEffect(() => {
    // Monitor resource loading with fallbacks
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const handleLoad = () => {
      try {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (perfData) {
          const metrics = {
            ttfb: perfData.responseStart - perfData.requestStart,
            domComplete: perfData.domComplete - perfData.fetchStart,
            loadComplete: perfData.loadEventEnd - perfData.fetchStart
          };
          
          console.log('Performance Metrics:', metrics);
          
          // Track slow loading with fallback
          if (metrics.loadComplete > 3000) {
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'slow_loading', {
                event_category: 'Performance',
                value: Math.round(metrics.loadComplete)
              });
            }
          }
        }
      } catch (e) {
        console.warn('Performance metrics collection failed:', e);
      }
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const trackCustomMetric = (name: string, value: number) => {
    console.log(`Custom Metric - ${name}:`, value);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', 'custom_metric', {
          event_category: 'Performance',
          event_label: name,
          value: Math.round(value)
        });
      } catch (e) {
        console.warn('Failed to track custom metric:', e);
      }
    }
  };

  return { trackCustomMetric };
};
