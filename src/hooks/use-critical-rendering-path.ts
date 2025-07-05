import React, { useEffect, useState, useCallback } from 'react';

interface CriticalRenderingMetrics {
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  firstInputDelay: number | null;
  cumulativeLayoutShift: number | null;
  timeToInteractive: number | null;
}

interface CriticalPathOptimizations {
  preloadCriticalResources: () => void;
  optimizeCriticalPath: () => void;
  measurePerformanceMetrics: () => CriticalRenderingMetrics;
  enableResourceHints: () => void;
}

export const useCriticalRenderingPath = (): CriticalPathOptimizations => {
  const [metrics, setMetrics] = useState<CriticalRenderingMetrics>({
    firstContentfulPaint: null,
    largestContentfulPaint: null,  
    firstInputDelay: null,
    cumulativeLayoutShift: null,
    timeToInteractive: null
  });

  // Preload critical resources dynamically
  const preloadCriticalResources = useCallback(() => {
    // Preload critical images for LCP
    const criticalImages = [
      '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png',
      '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    });

    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
    fontLink.crossOrigin = 'anonymous';
    fontLink.type = 'font/woff2';
    document.head.appendChild(fontLink);
  }, []);

  // Optimize critical rendering path
  const optimizeCriticalPath = useCallback(() => {
    // Remove render-blocking resources
    const nonCriticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    nonCriticalStyles.forEach(link => {
      const styleLink = link as HTMLLinkElement;
      styleLink.media = 'print';
      styleLink.onload = () => {
        styleLink.media = 'all';
        styleLink.onload = null;
      };
    });

    // Inline critical CSS
    const criticalCSS = `
      .lcp-container{contain:layout style paint;will-change:transform}
      .above-fold{visibility:visible!important;opacity:1!important}
      body{font-display:swap}
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);

    // Optimize script loading
    const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
    scripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      if (!scriptElement.src.includes('main.tsx') && !scriptElement.src.includes('gptengineer')) {
        scriptElement.defer = true;
      }
    });
  }, []);

  // Measure Core Web Vitals
  const measurePerformanceMetrics = useCallback((): CriticalRenderingMetrics => {
    const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Get Web Vitals using PerformanceObserver
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }));
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // FID Observer  
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({
            ...prev,
            firstInputDelay: entry.processingStart - entry.startTime
          }));
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        setMetrics(prev => ({
          ...prev,
          cumulativeLayoutShift: clsValue
        }));
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }

    return {
      firstContentfulPaint: perfEntries?.responseStart || null,
      largestContentfulPaint: metrics.largestContentfulPaint,
      firstInputDelay: metrics.firstInputDelay,
      cumulativeLayoutShift: metrics.cumulativeLayoutShift,
      timeToInteractive: perfEntries?.domInteractive - perfEntries?.fetchStart || null
    };
  }, [metrics]);

  // Enable advanced resource hints
  const enableResourceHints = useCallback(() => {
    // DNS prefetch for external domains
    const domains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com', 
      'www.googletagmanager.com',
      'static.hotjar.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical origins
    const preconnectDomains = ['fonts.googleapis.com', 'fonts.gstatic.com'];
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  // Initialize optimizations on mount
  useEffect(() => {
    const initOptimizations = () => {
      preloadCriticalResources();
      optimizeCriticalPath();
      enableResourceHints();
      
      // Defer non-critical operations
      setTimeout(() => {
        measurePerformanceMetrics();
      }, 100);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initOptimizations);
    } else {
      initOptimizations();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initOptimizations);
    };
  }, [preloadCriticalResources, optimizeCriticalPath, enableResourceHints, measurePerformanceMetrics]);

  return {
    preloadCriticalResources,
    optimizeCriticalPath,
    measurePerformanceMetrics,
    enableResourceHints
  };
};