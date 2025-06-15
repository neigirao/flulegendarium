
import { useEffect } from 'react';
import { performanceBudgetMonitor } from '@/services/performance-budgets';
import { addBreadcrumb, setContext } from '@/services/sentry';

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

    // Web Vitals tracking with budget monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcpValue = lastEntry.startTime;
        
        console.log('LCP:', lcpValue);
        performanceBudgetMonitor.checkBudget('LCP', lcpValue);
        
        addBreadcrumb({
          message: 'LCP Measured',
          data: { value: lcpValue },
          level: 'info'
        });
        
        // Track to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lcpValue),
            event_category: 'Performance'
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fidValue = entry.processingStart - entry.startTime;
          console.log('FID:', fidValue);
          performanceBudgetMonitor.checkBudget('FID', fidValue);
          
          addBreadcrumb({
            message: 'FID Measured',
            data: { value: fidValue },
            level: 'info'
          });
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fidValue),
              event_category: 'Performance'
            });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
        performanceBudgetMonitor.checkBudget('CLS', clsValue);
        
        addBreadcrumb({
          message: 'CLS Measured',
          data: { value: clsValue },
          level: 'info'
        });
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Performance'
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const fcpValue = entry.startTime;
            console.log('FCP:', fcpValue);
            performanceBudgetMonitor.checkBudget('FCP', fcpValue);
            
            addBreadcrumb({
              message: 'FCP Measured',
              data: { value: fcpValue },
              level: 'info'
            });
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'FCP',
                value: Math.round(fcpValue),
                event_category: 'Performance'
              });
            }
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Cleanup observers
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        fcpObserver.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    // Monitor resource loading - separate useEffect to avoid type issues
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const handleLoad = () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        ttfb: perfData.responseStart - perfData.requestStart,
        domComplete: perfData.domComplete - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart
      };
      
      console.log('Performance Metrics:', metrics);
      
      // Check budgets
      performanceBudgetMonitor.checkBudget('TTFB', metrics.ttfb);
      
      // Set performance context in Sentry
      setContext('performanceMetrics', metrics);
      
      // Track slow loading
      if (metrics.loadComplete > 3000) {
        performanceBudgetMonitor.checkBudget('Page Load Time', metrics.loadComplete);
        
        if (window.gtag) {
          window.gtag('event', 'slow_loading', {
            event_category: 'Performance',
            value: Math.round(metrics.loadComplete)
          });
        }
      }
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const trackCustomMetric = (name: string, value: number) => {
    console.log(`Custom Metric - ${name}:`, value);
    
    // Check if it's a known budget metric
    performanceBudgetMonitor.checkBudget(name, value);
    
    addBreadcrumb({
      message: 'Custom Metric Tracked',
      data: { name, value },
      level: 'info'
    });
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'custom_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }
  };

  return { trackCustomMetric };
};
