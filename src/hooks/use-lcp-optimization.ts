import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface LCPMetrics {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  element?: string;
}

export const useLCPOptimization = () => {
  const hasPreloaded = useRef(false);
  const lcpMetrics = useRef<LCPMetrics | null>(null);

  const measureLCP = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcp = entry.startTime;
            const rating = lcp <= 2500 ? (lcp <= 1200 ? 'good' : 'needs-improvement') : 'poor';
            
            lcpMetrics.current = {
              value: lcp,
              rating,
              element: (entry as PerformanceEntry & { element?: HTMLElement }).element?.tagName
            };
            
            logger.info(`LCP: ${lcp.toFixed(2)}ms (${rating})`, 'LCP_OPTIMIZATION');
            
            // Track in analytics
            if (window.gtag) {
              window.gtag('event', 'lcp_measurement', {
                event_category: 'Performance',
                value: Math.round(lcp),
                event_label: rating
              });
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      return () => observer.disconnect();
    } catch (error) {
      logger.warn('LCP observer not supported', 'LCP_OPTIMIZATION', error);
    }
  }, []);

  const optimizeForLCP = useCallback(() => {
    // Mark critical images as high priority
    const criticalImages = document.querySelectorAll('img[data-lcp-critical="true"]');
    criticalImages.forEach(img => {
      const imgEl = img as HTMLImageElement;
      imgEl.fetchPriority = 'high';
      imgEl.loading = 'eager';
      imgEl.decoding = 'sync';
    });

    // Add loading="lazy" to non-critical images
    const nonCriticalImages = document.querySelectorAll('img:not([data-lcp-critical="true"]):not([loading])');
    nonCriticalImages.forEach(img => {
      const imgEl = img as HTMLImageElement;
      if (!imgEl.closest('[data-above-fold="true"]')) {
        imgEl.loading = 'lazy';
        imgEl.decoding = 'async';
      }
    });

    logger.info(`LCP optimizations applied: ${criticalImages.length} critical, ${nonCriticalImages.length} lazy`, 'LCP_OPTIMIZATION');
  }, []);

  const preloadImage = useCallback((src: string, priority: 'high' | 'low' = 'high') => {
    if (!src || hasPreloaded.current) return;

    const existing = document.querySelector(`link[href="${src}"][rel="preload"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    link.fetchPriority = priority;
    link.setAttribute('data-lcp-candidate', 'true');
    
    // Set correct type based on extension
    if (src.endsWith('.webp')) {
      link.type = 'image/webp';
    } else if (src.endsWith('.jpg') || src.endsWith('.jpeg')) {
      link.type = 'image/jpeg';
    } else if (src.endsWith('.png')) {
      link.type = 'image/png';
    }
    
    document.head.appendChild(link);
    logger.debug(`Preloading image: ${src}`, 'LCP_OPTIMIZATION');
  }, []);

  const preloadLCPElements = useCallback(() => {
    if (hasPreloaded.current) return;
    hasPreloaded.current = true;

    // Preload hero/logo images
    const heroImages = [
      '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png', // OG image
      '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', // Logo
    ];

    heroImages.forEach((src, index) => {
      preloadImage(src, index === 0 ? 'high' : 'low');
    });

    logger.info('LCP elements preloaded', 'LCP_OPTIMIZATION');
  }, [preloadImage]);

  const preloadPlayerImage = useCallback((imageUrl: string) => {
    if (!imageUrl) return;
    
    // Only preload valid URLs
    try {
      new URL(imageUrl);
      preloadImage(imageUrl, 'high');
    } catch {
      // Local path
      if (imageUrl.startsWith('/')) {
        preloadImage(imageUrl, 'high');
      }
    }
  }, [preloadImage]);

  const identifyLCPElement = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { element?: HTMLElement; size?: number };
        
        if (lastEntry?.element) {
          const el = lastEntry.element as HTMLImageElement;
          logger.debug('LCP Element', 'LCP_OPTIMIZATION', {
            tag: lastEntry.element.tagName,
            src: el.src || el.currentSrc || 'N/A',
            size: lastEntry.size
          });
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      setTimeout(() => observer.disconnect(), 10000);
    } catch (error) {
      logger.warn('LCP element identification failed', 'LCP_OPTIMIZATION', error);
    }
  }, []);

  const getLCPMetrics = useCallback(() => lcpMetrics.current, []);

  useEffect(() => {
    preloadLCPElements();
    optimizeForLCP();
    const cleanup = measureLCP();
    identifyLCPElement();
    
    return cleanup;
  }, [preloadLCPElements, optimizeForLCP, measureLCP, identifyLCPElement]);

  return {
    measureLCP,
    optimizeForLCP,
    preloadLCPElements,
    preloadPlayerImage,
    identifyLCPElement,
    getLCPMetrics
  };
};
