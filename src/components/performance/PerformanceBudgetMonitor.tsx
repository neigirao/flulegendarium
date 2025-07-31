import { useEffect, useRef } from 'react';

interface PerformanceBudget {
  lcp: number;
  fcp: number;
  cls: number;
  ttfb: number;
  bundleSize: number;
  imageSize: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500,   // Largest Contentful Paint
  fcp: 1800,   // First Contentful Paint
  cls: 0.1,    // Cumulative Layout Shift
  ttfb: 800,   // Time to First Byte
  bundleSize: 200000,  // 200KB total JS bundle
  imageSize: 500000    // 500KB max per image
};

export const PerformanceBudgetMonitor = () => {
  const budgetRef = useRef<PerformanceBudget>(DEFAULT_BUDGET);
  const metricsRef = useRef<Partial<PerformanceBudget>>({});

  useEffect(() => {
    // Monitor bundle size
    const checkBundleSize = () => {
      if ('performance' in window) {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalJSSize = 0;
        let totalImageSize = 0;

        entries.forEach(entry => {
          if (entry.name.includes('.js')) {
            totalJSSize += entry.transferSize || 0;
          } else if (entry.name.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)) {
            const imageSize = entry.transferSize || 0;
            totalImageSize += imageSize;
            
            // Check individual image budget
            if (imageSize > budgetRef.current.imageSize) {
              console.warn(`🚨 Image budget exceeded: ${entry.name} = ${(imageSize / 1024).toFixed(1)}KB (budget: ${(budgetRef.current.imageSize / 1024).toFixed(1)}KB)`);
              
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'performance_budget_exceeded', {
                  metric_name: 'image_size',
                  metric_value: imageSize,
                  budget_value: budgetRef.current.imageSize,
                  resource_url: entry.name
                });
              }
            }
          }
        });

        metricsRef.current.bundleSize = totalJSSize;

        // Check bundle budget
        if (totalJSSize > budgetRef.current.bundleSize) {
          console.warn(`🚨 Bundle budget exceeded: ${(totalJSSize / 1024).toFixed(1)}KB (budget: ${(budgetRef.current.bundleSize / 1024).toFixed(1)}KB)`);
          
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'performance_budget_exceeded', {
              metric_name: 'bundle_size',
              metric_value: totalJSSize,
              budget_value: budgetRef.current.bundleSize
            });
          }
        }
      }
    };

    // Monitor Core Web Vitals
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry) {
              const lcp = lastEntry.startTime;
              metricsRef.current.lcp = lcp;
              
              if (lcp > budgetRef.current.lcp) {
                console.warn(`🚨 LCP budget exceeded: ${lcp.toFixed(0)}ms (budget: ${budgetRef.current.lcp}ms)`);
                
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'performance_budget_exceeded', {
                    metric_name: 'lcp',
                    metric_value: Math.round(lcp),
                    budget_value: budgetRef.current.lcp
                  });
                }
              } else {
                console.log(`✅ LCP within budget: ${lcp.toFixed(0)}ms`);
              }
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          return () => observer.disconnect();
        } catch (error) {
          console.warn('LCP monitoring not supported:', error);
        }
      }
    };

    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShift = entry as any;
              if (!layoutShift.hadRecentInput) {
                clsValue += layoutShift.value;
              }
            }
            
            metricsRef.current.cls = clsValue;
            
            if (clsValue > budgetRef.current.cls) {
              console.warn(`🚨 CLS budget exceeded: ${clsValue.toFixed(3)} (budget: ${budgetRef.current.cls})`);
              
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'performance_budget_exceeded', {
                  metric_name: 'cls',
                  metric_value: Math.round(clsValue * 1000),
                  budget_value: Math.round(budgetRef.current.cls * 1000)
                });
              }
            }
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          return () => observer.disconnect();
        } catch (error) {
          console.warn('CLS monitoring not supported:', error);
        }
      }
    };

    // Check navigation timing for FCP and TTFB
    const checkNavigationTiming = () => {
      if ('performance' in window && performance.getEntriesByType) {
        const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.fetchStart;
          const fcp = navigation.responseEnd - navigation.fetchStart;
          
          metricsRef.current.ttfb = ttfb;
          metricsRef.current.fcp = fcp;
          
          // Check TTFB budget
          if (ttfb > budgetRef.current.ttfb) {
            console.warn(`🚨 TTFB budget exceeded: ${ttfb.toFixed(0)}ms (budget: ${budgetRef.current.ttfb}ms)`);
            
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'performance_budget_exceeded', {
                metric_name: 'ttfb',
                metric_value: Math.round(ttfb),
                budget_value: budgetRef.current.ttfb
              });
            }
          }
          
          // Check FCP budget  
          if (fcp > budgetRef.current.fcp) {
            console.warn(`🚨 FCP budget exceeded: ${fcp.toFixed(0)}ms (budget: ${budgetRef.current.fcp}ms)`);
            
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'performance_budget_exceeded', {
                metric_name: 'fcp',
                metric_value: Math.round(fcp),
                budget_value: budgetRef.current.fcp
              });
            }
          }
        }
      }
    };

    // Generate performance report
    const generateReport = () => {
      console.group('📊 Performance Budget Report');
      
      Object.entries(metricsRef.current).forEach(([metric, value]) => {
        const budget = budgetRef.current[metric as keyof PerformanceBudget];
        const isWithinBudget = (value || 0) <= budget;
        const emoji = isWithinBudget ? '✅' : '🚨';
        
        console.log(`${emoji} ${metric.toUpperCase()}: ${typeof value === 'number' ? value.toFixed(metric === 'cls' ? 3 : 0) : 'N/A'}${metric.includes('Size') ? 'KB' : metric === 'cls' ? '' : 'ms'} (budget: ${metric === 'cls' ? budget : Math.round(budget)}${metric.includes('Size') ? 'KB' : metric === 'cls' ? '' : 'ms'})`);
      });
      
      console.groupEnd();
    };

    // Initialize monitoring
    const lcpCleanup = observeLCP();
    const clsCleanup = observeCLS();
    
    // Delay non-critical checks
    setTimeout(() => {
      checkBundleSize();
      checkNavigationTiming();
    }, 2000);

    // Generate report after everything loads
    setTimeout(generateReport, 5000);

    return () => {
      lcpCleanup?.();
      clsCleanup?.();
    };
  }, []);

  return null;
};