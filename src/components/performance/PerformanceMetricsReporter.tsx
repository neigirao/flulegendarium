import { useEffect, useRef } from 'react';
import { useCoreWebVitals } from '@/hooks/performance';

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType?: string;
}

export const PerformanceMetricsReporter = () => {
  const { reportMetric } = useCoreWebVitals();
  const metricsRef = useRef<Map<string, PerformanceMetric>>(new Map());
  const reportedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Report custom performance metrics
    const reportCustomMetrics = () => {
      // Time to Interactive (TTI) approximation
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation && !reportedRef.current.has('custom-tti')) {
        const tti = navigation.domInteractive - navigation.fetchStart;
        
        reportMetric({
          name: 'TTI',
          value: tti,
          delta: tti,
          id: 'custom-tti'
        });
        
        reportedRef.current.add('custom-tti');
      }

      // Resource loading performance
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      if (resources.length > 0 && !reportedRef.current.has('resource-summary')) {
        const totalResourceTime = resources.reduce((total, resource) => {
          return total + (resource.responseEnd - resource.startTime);
        }, 0);
        
        const avgResourceTime = totalResourceTime / resources.length;
        
        reportMetric({
          name: 'AVG_RESOURCE_TIME',
          value: avgResourceTime,
          delta: avgResourceTime,
          id: 'resource-summary'
        });
        
        reportedRef.current.add('resource-summary');
      }
    };

    // Report metrics after page load
    if (document.readyState === 'complete') {
      reportCustomMetrics();
    } else {
      window.addEventListener('load', reportCustomMetrics);
    }

    // Performance budget alerting
    const checkPerformanceBudgets = () => {
      const budgets = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        FCP: 1800,
        TTFB: 800
      };

      metricsRef.current.forEach((metric) => {
        const budget = budgets[metric.name as keyof typeof budgets];
        
        if (budget && metric.value > budget) {
          console.warn(`⚠️ Performance budget exceeded: ${metric.name}`, {
            value: metric.value,
            budget,
            excess: metric.value - budget
          });
          
          // Send to analytics if available
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'performance_budget_exceeded', {
              metric_name: metric.name,
              metric_value: Math.round(metric.value),
              budget_value: budget,
              page_path: window.location.pathname
            });
          }
        }
      });
    };

    // Monitor performance entries
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure' || entry.entryType === 'mark') {
          const metric: PerformanceMetric = {
            name: entry.name,
            value: entry.duration || entry.startTime,
            delta: entry.duration || entry.startTime,
            id: `${entry.name}-${Date.now()}`
          };
          
          metricsRef.current.set(entry.name, metric);
          reportMetric(metric);
        }
      });
      
      checkPerformanceBudgets();
    });

    try {
      observer.observe({ entryTypes: ['measure', 'mark'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    // Custom marks for important app events
    const markAppEvents = () => {
      // Mark critical app initialization points
      performance.mark('app-start');
      
      // Mark when React hydration completes
      setTimeout(() => {
        performance.mark('app-hydrated');
        performance.measure('app-hydration-time', 'app-start', 'app-hydrated');
      }, 0);
    };

    markAppEvents();

    return () => {
      observer.disconnect();
      window.removeEventListener('load', reportCustomMetrics);
    };
  }, [reportMetric]);

  // Report final metrics on page unload
  useEffect(() => {
    const reportFinalMetrics = () => {
      // Send final performance summary
      const summary = {
        totalMetrics: metricsRef.current.size,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 100)
      };
      
      console.log('📊 Final performance metrics:', summary);
      
      // Send to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'performance_summary', summary);
      }
    };

    window.addEventListener('beforeunload', reportFinalMetrics);
    
    return () => {
      window.removeEventListener('beforeunload', reportFinalMetrics);
    };
  }, []);

  return null;
};