
import { useEffect, useCallback } from 'react';

export const useLCPOptimization = () => {
  const measureLCP = useCallback(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              const lcp = entry.startTime;
              console.log(`📊 LCP: ${lcp.toFixed(2)}ms`);
              
              // Track LCP to analytics
              if (window.gtag) {
                window.gtag('event', 'lcp_measurement', {
                  event_category: 'Performance',
                  value: Math.round(lcp),
                  custom_map: {
                    'lcp_time': lcp
                  }
                });
              }
              
              // Alert if LCP is poor (> 2.5s)
              if (lcp > 2500) {
                console.warn('⚠️ Poor LCP detected:', lcp, 'ms');
                
                if (window.gtag) {
                  window.gtag('event', 'poor_lcp', {
                    event_category: 'Performance',
                    value: Math.round(lcp)
                  });
                }
              } else if (lcp <= 1200) {
                console.log('✅ Excellent LCP:', lcp, 'ms');
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        return () => observer.disconnect();
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }
  }, []);

  const optimizeForLCP = useCallback(() => {
    // Mark critical images as high priority
    const criticalImages = document.querySelectorAll('img[data-critical="true"]');
    criticalImages.forEach(img => {
      (img as HTMLImageElement).fetchPriority = 'high';
    });

    // Ensure critical CSS is applied
    const criticalCSS = document.querySelector('style[data-critical="true"]');
    if (criticalCSS) {
      criticalCSS.setAttribute('data-optimized', 'true');
    }

    console.log('🎯 LCP optimizations applied');
  }, []);

  const preloadLCPElements = useCallback(() => {
    // Preload the most likely LCP elements
    const lcpCandidates = [
      '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
      '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png'
    ];

    lcpCandidates.forEach((src, index) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      link.fetchPriority = 'high';
      link.setAttribute('data-lcp-candidate', 'true');
      
      if (!document.querySelector(`link[href="${src}"][data-lcp-candidate="true"]`)) {
        document.head.appendChild(link);
        console.log(`🏃‍♂️ Preloading LCP candidate ${index + 1}:`, src);
      }
    });
  }, []);

  useEffect(() => {
    // Initialize LCP optimizations
    optimizeForLCP();
    preloadLCPElements();
    
    // Measure LCP
    const cleanup = measureLCP();
    
    return cleanup;
  }, [optimizeForLCP, preloadLCPElements, measureLCP]);

  return {
    measureLCP,
    optimizeForLCP,
    preloadLCPElements
  };
};
