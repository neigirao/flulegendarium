
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
                console.warn('🚨 Poor LCP detected:', lcp, 'ms - Needs optimization');
                
                if (window.gtag) {
                  window.gtag('event', 'poor_lcp', {
                    event_category: 'Performance',
                    value: Math.round(lcp),
                    event_label: 'needs_optimization'
                  });
                }
              } else if (lcp <= 1200) {
                console.log('🏆 Excellent LCP:', lcp, 'ms');
                
                if (window.gtag) {
                  window.gtag('event', 'excellent_lcp', {
                    event_category: 'Performance',
                    value: Math.round(lcp)
                  });
                }
              } else if (lcp <= 2500) {
                console.log('✅ Good LCP:', lcp, 'ms');
                
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
        console.warn('LCP observer not supported:', error);
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

    console.log('🎯 LCP optimizations applied to', criticalImages.length, 'critical images');
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
      console.log(`🚀 Preloading logo image:`, logoSrc);
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
            console.log('🔍 LCP Element identified:', lastEntry.element);
            console.log('🔍 LCP Element tag:', lastEntry.element.tagName);
            console.log('🔍 LCP Element src:', lastEntry.element.src || 'N/A');
            console.log('🔍 LCP Element class:', lastEntry.element.className || 'N/A');
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Disconnect after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
      } catch (error) {
        console.warn('LCP element identification failed:', error);
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
