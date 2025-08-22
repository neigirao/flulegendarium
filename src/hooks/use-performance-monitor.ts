
import { useEffect, useCallback } from 'react';
import { useCoreWebVitals } from './use-core-web-vitals';
import { useBundleAnalyzer } from './use-bundle-analyzer';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

export const usePerformanceMonitor = () => {
  const { reportMetric } = useCoreWebVitals();
  const { trackChunkLoad } = useBundleAnalyzer();

  // Monitor route changes performance
  const trackRouteChange = useCallback((routeName: string) => {
    const startTime = performance.now();
    
    // Use requestIdleCallback for non-critical tracking
    const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
    
    requestIdle(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.info(`Route change to ${routeName}`, 'PERFORMANCE', { duration: `${duration.toFixed(2)}ms` });
      
      // Track slow route changes
      if (duration > 500) {
        if (window.gtag) {
          window.gtag('event', 'slow_route_change', {
            event_category: 'Performance',
            event_label: routeName,
            value: Math.round(duration)
          });
        }
      }
    });
  }, []);

  // Monitor memory usage
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
      
      console.log('🧠 Memory usage:', {
        used: `${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memoryUsage.total / 1024 / 1024).toFixed(2)}MB`,
        usage: `${((memoryUsage.used / memoryUsage.total) * 100).toFixed(1)}%`
      });
      
      // Alert if memory usage is high
      if (memoryUsage.used / memoryUsage.limit > 0.9) {
        console.warn('⚠️ High memory usage detected');
        if (window.gtag) {
          window.gtag('event', 'high_memory_usage', {
            event_category: 'Performance',
            value: Math.round((memoryUsage.used / memoryUsage.limit) * 100)
          });
        }
      }
    }
  }, []);

  // Performance budget monitoring
  const checkPerformanceBudget = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const budgets = {
      totalJS: 400 * 1024, // 400KB
      totalCSS: 100 * 1024, // 100KB
      totalImages: 2 * 1024 * 1024, // 2MB
      totalFonts: 200 * 1024 // 200KB
    };

    const usage = {
      js: resources.filter(r => r.name.includes('.js')).reduce((sum, r) => sum + (r.transferSize || 0), 0),
      css: resources.filter(r => r.name.includes('.css')).reduce((sum, r) => sum + (r.transferSize || 0), 0),
      images: resources.filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)).reduce((sum, r) => sum + (r.transferSize || 0), 0),
      fonts: resources.filter(r => /\.(woff|woff2|ttf|otf)/.test(r.name)).reduce((sum, r) => sum + (r.transferSize || 0), 0)
    };

    const budgetStatus = {
      js: usage.js <= budgets.totalJS,
      css: usage.css <= budgets.totalCSS,
      images: usage.images <= budgets.totalImages,
      fonts: usage.fonts <= budgets.totalFonts
    };

    console.log('💰 Performance Budget Status:', {
      js: `${(usage.js / 1024).toFixed(2)}KB / ${(budgets.totalJS / 1024).toFixed(2)}KB ${budgetStatus.js ? '✅' : '❌'}`,
      css: `${(usage.css / 1024).toFixed(2)}KB / ${(budgets.totalCSS / 1024).toFixed(2)}KB ${budgetStatus.css ? '✅' : '❌'}`,
      images: `${(usage.images / 1024 / 1024).toFixed(2)}MB / ${(budgets.totalImages / 1024 / 1024).toFixed(2)}MB ${budgetStatus.images ? '✅' : '❌'}`,
      fonts: `${(usage.fonts / 1024).toFixed(2)}KB / ${(budgets.totalFonts / 1024).toFixed(2)}KB ${budgetStatus.fonts ? '✅' : '❌'}`
    });

    // Track budget violations
    Object.entries(budgetStatus).forEach(([type, withinBudget]) => {
      if (!withinBudget && window.gtag) {
        window.gtag('event', 'budget_violation', {
          event_category: 'Performance',
          event_label: type,
          value: Math.round(usage[type as keyof typeof usage] / 1024)
        });
      }
    });
  }, []);

  useEffect(() => {
    // Check performance budget after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        checkPerformanceBudget();
        trackMemoryUsage();
      }, 2000);
    });

    // Periodic memory monitoring in development
    if (process.env.NODE_ENV === 'development') {
      const memoryInterval = setInterval(trackMemoryUsage, 30000); // Every 30s
      return () => clearInterval(memoryInterval);
    }
  }, [checkPerformanceBudget, trackMemoryUsage]);

  return {
    trackRouteChange,
    trackMemoryUsage,
    checkPerformanceBudget,
    trackChunkLoad
  };
};
