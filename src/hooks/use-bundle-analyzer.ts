
import { useEffect } from 'react';

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
      
      console.log('Bundle Metrics:', {
        totalJSSize: `${(totalJSSize / 1024).toFixed(2)}KB`,
        avgLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        chunkCount: jsResources.length
      });
      
      // Track to analytics if bundle is too large
      if (totalJSSize > 500 * 1024) { // > 500KB
        if (window.gtag) {
          window.gtag('event', 'large_bundle', {
            event_category: 'Performance',
            value: Math.round(totalJSSize / 1024),
            event_label: 'bundle_size_kb'
          });
        }
      }
      
      // Track slow chunk loading
      if (avgLoadTime > 1000) { // > 1s
        if (window.gtag) {
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
    
    // Track dynamic imports
    const originalImport = window.import || (() => {});
    // @ts-ignore
    window.import = async (...args) => {
      const startTime = performance.now();
      try {
        const result = await originalImport(...args);
        const loadTime = performance.now() - startTime;
        
        console.log(`Dynamic import loaded in ${loadTime.toFixed(2)}ms:`, args[0]);
        
        if (window.gtag) {
          window.gtag('event', 'dynamic_import', {
            event_category: 'Performance',
            value: Math.round(loadTime),
            event_label: args[0]
          });
        }
        
        return result;
      } catch (error) {
        console.error('Dynamic import failed:', error);
        throw error;
      }
    };
  }, []);
  
  const trackChunkLoad = (chunkName: string, size: number, loadTime: number) => {
    console.log(`Chunk ${chunkName} loaded: ${size}KB in ${loadTime}ms`);
    
    if (window.gtag) {
      window.gtag('event', 'chunk_loaded', {
        event_category: 'Performance',
        event_label: chunkName,
        value: Math.round(loadTime)
      });
    }
  };
  
  return { trackChunkLoad };
};
