import { useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

export const useLCPOptimization = () => {
  const measureLCP = useCallback(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              const lcp = entry.startTime;
              logger.info(`LCP: ${lcp.toFixed(2)}ms`, 'LCP_OPTIMIZATION');
              
              // Enhanced LCP tracking
              if (window.gtag) {
                window.gtag('event', 'lcp_measurement', {
                  event_category: 'Performance',
                  value: Math.round(lcp),
                  custom_map: {
                    'lcp_time': lcp
                  }
                });
              }
              
              // Detailed LCP analysis
              if (lcp > 2500) {
                logger.warn(`Poor LCP detected: ${lcp}ms - Needs optimization`, 'LCP_OPTIMIZATION');
                
                if (window.gtag) {
                  window.gtag('event', 'poor_lcp', {
                    event_category: 'Performance',
                    value: Math.round(lcp),
                    event_label: 'needs_optimization'
                  });
                }
              } else if (lcp <= 1200) {
                logger.info(`Excellent LCP: ${lcp}ms`, 'LCP_OPTIMIZATION');
                
                if (window.gtag) {
                  window.gtag('event', 'excellent_lcp', {
                    event_category: 'Performance',
                    value: Math.round(lcp)
                  });
                }
              } else if (lcp <= 2500) {
                logger.info(`Good LCP: ${lcp}ms`, 'LCP_OPTIMIZATION');
                
                if (window.gtag) {
                  window.gtag('event', 'good_lcp', {
                    event_category: 'Performance',
                    value: Math.round(lcp)
                  });
                }
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        return () => observer.disconnect();
      } catch (error) {
        logger.warn('LCP observer not supported', 'LCP_OPTIMIZATION', error);
      }
    }
  }, []);

  const optimizeForLCP = useCallback(() => {
    // Mark critical images as high priority
    const criticalImages = document.querySelectorAll('img[data-lcp-critical="true"]');
    criticalImages.forEach(img => {
      (img as HTMLImageElement).fetchPriority = 'high';
      (img as HTMLImageElement).loading = 'eager';
      (img as HTMLImageElement).decoding = 'sync';
    });

    // Ensure critical CSS is applied
    const criticalCSS = document.querySelector('style[data-critical="true"]');
    if (criticalCSS) {
      criticalCSS.setAttribute('data-optimized', 'true');
    }

    logger.info(`LCP optimizations applied to ${criticalImages.length} critical images`, 'LCP_OPTIMIZATION');
  }, []);

  const preloadLCPElements = useCallback(() => {
    // Only preload the logo which is actually used immediately
    const logoSrc = '/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png';
    
    const existing = document.querySelector(`link[href="${logoSrc}"][data-lcp-candidate="true"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = logoSrc;
      link.as = 'image';
      link.fetchPriority = 'high';
      link.crossOrigin = 'anonymous';
      link.setAttribute('data-lcp-candidate', 'true');
      link.type = 'image/png';
      
      document.head.appendChild(link);
      logger.info(`Preloading logo image: ${logoSrc}`, 'LCP_OPTIMIZATION');
    }
  }, []);

  const identifyLCPElement = useCallback(() => {
    // Try to identify the current LCP element
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          if (lastEntry && lastEntry.element) {
            logger.debug('LCP Element identified', 'LCP_OPTIMIZATION', {
              element: lastEntry.element,
              tag: lastEntry.element.tagName,
              src: lastEntry.element.src || 'N/A',
              class: lastEntry.element.className || 'N/A'
            });
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Disconnect after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
      } catch (error) {
        logger.warn('LCP element identification failed', 'LCP_OPTIMIZATION', error);
      }
    }
  }, []);

  useEffect(() => {
    // Initialize LCP optimizations immediately
    preloadLCPElements();
    optimizeForLCP();
    
    // Start measuring LCP
    const cleanup = measureLCP();
    
    // Identify LCP element for debugging
    identifyLCPElement();
    
    return cleanup;
  }, [preloadLCPElements, optimizeForLCP, measureLCP, identifyLCPElement]);

  return {
    measureLCP,
    optimizeForLCP,
    preloadLCPElements,
    identifyLCPElement
  };
};
