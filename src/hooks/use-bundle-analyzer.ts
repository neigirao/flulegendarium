
import { useEffect } from 'react';
import { logger } from '@/utils/logger';

interface BundleMetrics {
  chunkSize: number;
  loadTime: number;
  totalSize: number;
  cacheHitRate: number;
}

export const useBundleAnalyzer = () => {
  useEffect(() => {
    // Track bundle loading performance
    const trackBundleMetrics = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Filter JavaScript resources
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && 
        !resource.name.includes('node_modules')
      );
      
      const totalJSSize = jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      const avgLoadTime = jsResources.reduce((total, resource) => {
        return total + resource.duration;
      }, 0) / jsResources.length;
      
      logger.debug('Bundle Metrics', 'BUNDLE_ANALYZER', {
        totalJSSize: `${(totalJSSize / 1024).toFixed(2)}KB`,
        avgLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        chunkCount: jsResources.length
      });
      
      // Track to analytics if bundle is too large
      if (totalJSSize > 400 * 1024) { // Reduced threshold to 400KB
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'large_bundle', {
            event_category: 'Performance',
            value: Math.round(totalJSSize / 1024),
            event_label: 'bundle_size_kb'
          });
        }
      }
      
      // Track slow chunk loading
      if (avgLoadTime > 1000) { // > 1s
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'slow_chunk_loading', {
            event_category: 'Performance',
            value: Math.round(avgLoadTime),
            event_label: 'avg_load_time_ms'
          });
        }
      }
    };
    
    // Track after page load
    window.addEventListener('load', () => {
      setTimeout(trackBundleMetrics, 1000);
    });
    
    // Track dynamic imports with proper typing
    const trackDynamicImports = () => {
      // Override the dynamic import to track performance
      const originalImport = window.eval;
      
      // Monitor module loading through performance observer
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (entry.name.includes('.js') && entry.name.includes('assets/')) {
                const loadTime = entry.duration;
                logger.debug(`Dynamic chunk loaded in ${loadTime.toFixed(2)}ms`, 'BUNDLE_ANALYZER', { name: entry.name });
                
                if (window.gtag) {
                  window.gtag('event', 'dynamic_import', {
                    event_category: 'Performance',
                    value: Math.round(loadTime),
                    event_label: entry.name
                  });
                }
              }
            });
          });
          
          observer.observe({ entryTypes: ['resource'] });
        } catch (error) {
          logger.warn('Dynamic import tracking not supported', 'BUNDLE_ANALYZER', error);
        }
      }
    };
    
    trackDynamicImports();
  }, []);
  
  const trackChunkLoad = (chunkName: string, size: number, loadTime: number) => {
    logger.debug(`Chunk ${chunkName} loaded`, 'BUNDLE_ANALYZER', { size: `${size}KB`, loadTime: `${loadTime}ms` });
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chunk_loaded', {
        event_category: 'Performance',
        event_label: chunkName,
        value: Math.round(loadTime)
      });
    }
  };
  
  return { trackChunkLoad };
};
