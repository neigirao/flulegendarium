import { useEffect, useCallback, useRef } from 'react';
import { useCoreWebVitals } from './use-core-web-vitals';
import { useCriticalResources } from './use-critical-resources';
import { useBundleAnalyzer } from './use-bundle-analyzer';
import { Logger } from '@/utils/logger';
import { unifiedCache } from '@/utils/cache/UnifiedCacheManager';

interface PerformanceStats {
  serviceWorkerReady: boolean;
  criticalResourcesLoaded: boolean;
  observersActive: number;
  cacheHitRate: number;
}

export const useOptimizedPerformance = () => {
  const { reportMetric } = useCoreWebVitals();
  const { preloadCriticalImages, loadNonCriticalResources } = useCriticalResources();
  const { trackChunkLoad } = useBundleAnalyzer();
  
  const observersRef = useRef<{
    image?: IntersectionObserver;
    layout?: PerformanceObserver;
  }>({});
  
  const statsRef = useRef<PerformanceStats>({
    serviceWorkerReady: false,
    criticalResourcesLoaded: false,
    observersActive: 0,
    cacheHitRate: 0
  });

  // Service Worker registration with better error handling
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      Logger.info('Service Worker registered', { scope: registration.scope });
      statsRef.current.serviceWorkerReady = true;

      // Handle updates with debouncing
      let updateTimeout: number;
      registration.addEventListener('updatefound', () => {
        clearTimeout(updateTimeout);
        updateTimeout = window.setTimeout(() => {
          Logger.info('SW update available');
          if ((window as any).showUpdateToast) {
            (window as any).showUpdateToast();
          }
        }, 1000);
      });

      return registration;
    } catch (error) {
      Logger.error('SW registration failed', error as Error);
    }
  }, []);

  // Optimized critical path with better sequencing
  const optimizeCriticalPath = useCallback(async () => {
    Logger.debug('Starting critical path optimization');

    try {
      // Preload critical images immediately
      await preloadCriticalImages();
      
      // Load non-critical resources with intelligent delay
      const connection = (navigator as any).connection;
      const delay = connection?.effectiveType === 'slow-2g' ? 3000 : 1500;
      setTimeout(() => {
        loadNonCriticalResources();
        statsRef.current.criticalResourcesLoaded = true;
      }, delay);
      
    } catch (error) {
      Logger.error('Critical path optimization failed', error as Error);
    }
  }, [preloadCriticalImages, loadNonCriticalResources]);

  // Debounced component performance tracking
  const trackComponentPerformance = useCallback(
    (() => {
      let performanceQueue: Array<{ name: string; time: number }> = [];
      let flushTimeout: number;

      return (componentName: string, startTime: number) => {
        const renderTime = performance.now() - startTime;
        
        performanceQueue.push({ name: componentName, time: renderTime });
        
        // Debounced flush to avoid spam
        clearTimeout(flushTimeout);
        flushTimeout = window.setTimeout(() => {
          const slowComponents = performanceQueue.filter(p => p.time > 100);
          
          if (slowComponents.length > 0) {
            Logger.warn('Slow components detected', { count: slowComponents.length, components: slowComponents });
            
            // Report to analytics (batched)
            if (window.gtag) {
              window.gtag('event', 'performance_batch', {
                event_category: 'Performance',
                custom_parameter: JSON.stringify(slowComponents)
              });
            }
          }
          
          performanceQueue = [];
        }, 2000);

        return renderTime;
      };
    })()
  , []);

  // Intelligent image loading with cache integration
  const optimizeImageLoading = useCallback(() => {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            
            if (img.dataset.src) {
              // Check cache first
              const cached = unifiedCache.get(`image:${img.dataset.src}`);
               if (cached) {
                 img.src = cached as string;
              } else {
                img.src = img.dataset.src;
                unifiedCache.set(`image:${img.dataset.src}`, img.dataset.src, 30 * 60 * 1000); // 30min cache
              }
              
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      { rootMargin: '50px 0px', threshold: 0.1 }
    );

    // Observe existing images
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));
    
    observersRef.current.image = imageObserver;
    statsRef.current.observersActive++;

    return () => {
      imageObserver.disconnect();
      statsRef.current.observersActive--;
    };
  }, []);

  // Layout shift prevention with better CLS tracking
  const preventLayoutShift = useCallback(() => {
    // Add dimensions to dynamic elements
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    dynamicElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (!htmlElement.style.minHeight) {
        htmlElement.style.minHeight = '200px';
        htmlElement.style.transition = 'min-height 0.3s ease';
      }
    });

    // Throttled CLS observer
    let clsAccumulator = 0;
    let reportTimeout: number;
    
    if ('LayoutShift' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsAccumulator += (entry as any).value;
          }
        }
        
        // Debounced reporting
        clearTimeout(reportTimeout);
        reportTimeout = window.setTimeout(() => {
          if (clsAccumulator > 0.1) {
            Logger.warn('High CLS detected', { cls: clsAccumulator });
            // Report to analytics instead of web vitals directly
            if (window.gtag) {
              window.gtag('event', 'high_cls', {
                event_category: 'Performance',
                value: Math.round(clsAccumulator * 10000)
              });
            }
          }
          clsAccumulator = 0;
        }, 1000);
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.layout = observer;
        statsRef.current.observersActive++;
      } catch (e) {
        Logger.warn('Layout shift observation not supported');
      }
    }
  }, [reportMetric]);

  // Font loading optimization with cache
  const optimizeFontLoading = useCallback(() => {
    if (!('fonts' in document)) return;

    document.fonts.ready.then(() => {
      Logger.debug('All fonts loaded');
      
      // Cache font status
      unifiedCache.set('fonts:ready', true, 60 * 60 * 1000); // 1 hour cache
      
      // Optimize font display after loading
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach((link) => {
        (link as HTMLLinkElement).media = 'all';
      });
    });
  }, []);

  // Cleanup observers on unmount
  const cleanup = useCallback(() => {
    Object.values(observersRef.current).forEach(observer => {
      observer?.disconnect?.();
    });
    observersRef.current = {};
    statsRef.current.observersActive = 0;
  }, []);

  // Main optimization effect
  useEffect(() => {
    const startTime = performance.now();
    
    const runOptimizations = async () => {
      try {
        await registerServiceWorker();
        await optimizeCriticalPath();
        preventLayoutShift();
        optimizeFontLoading();
        optimizeImageLoading();
        
        const totalTime = performance.now() - startTime;
        Logger.info('Performance optimization complete', { 
          duration: totalTime,
          stats: statsRef.current
        });
        
        // Update cache stats
        statsRef.current.cacheHitRate = unifiedCache.getStats().hitRate;
        
      } catch (error) {
        Logger.error('Performance optimization failed', error as Error);
      }
    };

    runOptimizations();
    
    return cleanup;
  }, [registerServiceWorker, optimizeCriticalPath, preventLayoutShift, optimizeFontLoading, optimizeImageLoading, cleanup]);

  const getPerformanceStats = useCallback(() => {
    return {
      ...statsRef.current,
      cache: unifiedCache.getStats()
    };
  }, []);

  return {
    trackComponentPerformance,
    reportMetric,
    trackChunkLoad,
    getPerformanceStats,
    cleanup
  };
};