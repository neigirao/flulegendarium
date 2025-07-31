import { useEffect, useRef, useCallback } from 'react';
import { useCoreWebVitals } from '@/hooks/use-core-web-vitals';

interface CoreWebVitalsOptimizerProps {
  children: React.ReactNode;
}

export const CoreWebVitalsOptimizer = ({ children }: CoreWebVitalsOptimizerProps) => {
  const { reportMetric } = useCoreWebVitals();
  const layoutShiftTracker = useRef<number>(0);
  const observerRef = useRef<PerformanceObserver>();

  // Track and prevent layout shifts (CLS optimization)
  const preventLayoutShifts = useCallback(() => {
    // Add size attributes to prevent layout shifts
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      
      // Set placeholder dimensions based on aspect ratio
      if (!imgElement.width && !imgElement.height) {
        const aspectRatio = imgElement.dataset.aspectRatio || '16:9';
        const [w, h] = aspectRatio.split(':').map(Number);
        
        // Calculate dimensions based on container
        const container = imgElement.parentElement;
        if (container) {
          const containerWidth = container.offsetWidth || 300;
          imgElement.width = containerWidth;
          imgElement.height = (containerWidth * h) / w;
          imgElement.style.aspectRatio = aspectRatio;
        }
      }
    });

    // Ensure containers have explicit heights
    const containers = document.querySelectorAll('[data-prevent-cls]');
    containers.forEach(container => {
      const element = container as HTMLElement;
      if (!element.style.height && !element.style.minHeight) {
        element.style.minHeight = '200px'; // Minimum height to prevent shifts
      }
    });
  }, []);

  // Optimize LCP by prioritizing above-the-fold content
  const optimizeLCP = useCallback(() => {
    // Mark LCP candidates
    const lcpCandidates = document.querySelectorAll('[data-lcp-critical]');
    lcpCandidates.forEach(element => {
      const img = element as HTMLImageElement;
      if (img.tagName === 'IMG') {
        img.fetchPriority = 'high';
        img.loading = 'eager';
        img.decoding = 'sync';
      }
    });

    // Preload critical CSS
    const criticalCSS = document.querySelector('style[data-critical]');
    if (criticalCSS) {
      criticalCSS.setAttribute('media', 'all');
    }

    // Remove render-blocking resources after critical content loads
    setTimeout(() => {
      const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
      nonCriticalCSS.forEach(link => {
        const linkElement = link as HTMLLinkElement;
        linkElement.media = 'print';
        linkElement.onload = function() {
          (this as HTMLLinkElement).media = 'all';
        };
      });
    }, 100);
  }, []);

  // Optimize INP (Interaction to Next Paint)
  const optimizeINP = useCallback(() => {
    // Debounce rapid interactions
    let interactionTimer: NodeJS.Timeout;
    const debouncedInteraction = (callback: () => void) => {
      clearTimeout(interactionTimer);
      interactionTimer = setTimeout(callback, 16); // Next frame
    };

    // Optimize event listeners
    const addOptimizedListener = (element: Element, event: string, handler: EventListener) => {
      element.addEventListener(event, (e) => {
        debouncedInteraction(() => handler(e));
      }, { passive: true });
    };

    // Apply to common interactive elements
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Add visual feedback immediately
        button.classList.add('opacity-80');
        requestAnimationFrame(() => {
          button.classList.remove('opacity-80');
        });
      }, { passive: true });
    });
  }, []);

  // Initialize Core Web Vitals monitoring
  useEffect(() => {
    // Set up Layout Shift observer
    try {
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            layoutShiftTracker.current += (entry as any).value;
            
            // Report high layout shift values
            if ((entry as any).value > 0.1) {
              console.warn('High layout shift detected:', entry);
              
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'web_vitals', {
                  name: 'CLS_high',
                  value: Math.round((entry as any).value * 1000),
                  metric_id: 'cls-high'
                });
              }
            }
          }
        }
      });

      observerRef.current.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Layout shift monitoring not supported:', error);
    }

    // Apply optimizations
    preventLayoutShifts();
    optimizeLCP();
    optimizeINP();

    // Apply optimizations after DOM updates
    const mutationObserver = new MutationObserver(() => {
      requestIdleCallback(() => {
        preventLayoutShifts();
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Performance budget monitoring
    const checkPerformanceBudget = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          lcp: 0, // Will be measured by PerformanceObserver
          fcp: navigation.responseEnd - navigation.fetchStart,
          ttfb: navigation.responseStart - navigation.fetchStart,
          cls: layoutShiftTracker.current
        };

        // Check if metrics exceed budget
        const budget = {
          lcp: 2500,
          fcp: 1800,
          ttfb: 800,
          cls: 0.1
        };

        Object.entries(metrics).forEach(([metric, value]) => {
          const budgetValue = budget[metric as keyof typeof budget];
          if (value > budgetValue) {
            console.warn(`Performance budget exceeded: ${metric} = ${value}ms (budget: ${budgetValue}ms)`);
            
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'performance_budget_exceeded', {
                metric_name: metric,
                metric_value: value,
                budget_value: budgetValue
              });
            }
          }
        });
      }
    };

    // Check budget after page load
    if (document.readyState === 'complete') {
      checkPerformanceBudget();
    } else {
      window.addEventListener('load', checkPerformanceBudget);
    }

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, [preventLayoutShifts, optimizeLCP, optimizeINP]);

  // Report final CLS on page unload
  useEffect(() => {
    const reportFinalCLS = () => {
      reportMetric({
        name: 'CLS',
        value: layoutShiftTracker.current,
        delta: layoutShiftTracker.current,
        id: 'final-cls'
      });
    };

    window.addEventListener('beforeunload', reportFinalCLS);
    
    return () => {
      window.removeEventListener('beforeunload', reportFinalCLS);
    };
  }, [reportMetric]);

  return <>{children}</>;
};