
import { useEffect } from 'react';

export const PerformanceMetrics = () => {
  useEffect(() => {
    // Web Vitals tracking
    const trackWebVitals = () => {
      // Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming;
            
            // Track loading performance
            const loadTime = nav.loadEventEnd - nav.loadEventStart;
            const domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
            const firstByte = nav.responseStart - nav.requestStart;

            if (window.gtag) {
              window.gtag('event', 'page_load_time', {
                custom_parameter: loadTime,
                event_category: 'Performance'
              });

              window.gtag('event', 'dom_content_loaded', {
                custom_parameter: domContentLoaded,
                event_category: 'Performance'
              });

              window.gtag('event', 'time_to_first_byte', {
                custom_parameter: firstByte,
                event_category: 'Performance'
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });

      // Track Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (window.gtag && lastEntry) {
          window.gtag('event', 'largest_contentful_paint', {
            custom_parameter: Math.round(lastEntry.startTime),
            event_category: 'Performance'
          });
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID) when available
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Fixed: proper type assertion and property access
          const eventEntry = entry as PerformanceEventTiming;
          if (window.gtag && eventEntry.processingStart) {
            window.gtag('event', 'first_input_delay', {
              custom_parameter: Math.round(eventEntry.processingStart - eventEntry.startTime),
              event_category: 'Performance'
            });
          }
        });
      });

      // Check if PerformanceEventTiming is available
      if ('PerformanceEventTiming' in window) {
        fidObserver.observe({ entryTypes: ['first-input'] });
      }

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
      };
    };

    // Start tracking after initial load
    if (document.readyState === 'complete') {
      trackWebVitals();
    } else {
      window.addEventListener('load', trackWebVitals);
    }
  }, []);

  return null;
};
