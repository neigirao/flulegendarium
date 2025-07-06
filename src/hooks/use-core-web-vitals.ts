
import { useEffect, useCallback } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
}

export const useCoreWebVitals = () => {
  const reportMetric = useCallback((metric: WebVitalsMetric) => {
    console.log(`📊 ${metric.name}:`, metric.value);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: { metric_id: metric.id }
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamic import for web-vitals library simulation
    const measureWebVitals = async () => {
      try {
        // LCP - Largest Contentful Paint
        if ('PerformanceObserver' in window) {
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
            window.addEventListener('load', measureTTFB);
          }
        }
      } catch (error) {
        console.warn('Web Vitals measurement failed:', error);
      }
    };

    measureWebVitals();
  }, [reportMetric]);

  return { reportMetric };
};
