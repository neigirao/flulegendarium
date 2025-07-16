import React, { useEffect, useRef, useState } from 'react';
import { Sentry, measurePerformance } from '@/utils/sentry';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  });
  
  const observer = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Web Vitals measurement
    const measureWebVitals = () => {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        observer.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              const lcp = entry.startTime;
              setMetrics(prev => ({ ...prev, lcp }));
              
              // Report to Sentry
              Sentry.setMeasurement('lcp', lcp, 'millisecond');
              
              // Track performance issues
              if (lcp > 2500) {
                Sentry.captureMessage(`Poor LCP: ${lcp}ms`, 'warning');
              }
            }
            
            if (entry.entryType === 'first-input') {
              const fid = (entry as any).processingStart - entry.startTime;
              setMetrics(prev => ({ ...prev, fid }));
              
              Sentry.setMeasurement('fid', fid, 'millisecond');
              
              if (fid > 100) {
                Sentry.captureMessage(`Poor FID: ${fid}ms`, 'warning');
              }
            }
            
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              const cls = (entry as any).value;
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + cls 
              }));
              
              if (cls > 0.1) {
                Sentry.addBreadcrumb({
                  category: 'ui',
                  message: `Layout shift detected: ${cls}`,
                  level: 'warning'
                });
              }
            }
          });
        });
        
        observer.current.observe({ 
          type: 'largest-contentful-paint', 
          buffered: true 
        });
        observer.current.observe({ 
          type: 'first-input', 
          buffered: true 
        });
        observer.current.observe({ 
          type: 'layout-shift', 
          buffered: true 
        });
      }
      
      // Navigation timing
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const fcp = navigationEntry.responseStart - navigationEntry.fetchStart;
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        
        setMetrics(prev => ({ ...prev, fcp, ttfb }));
        
        Sentry.setMeasurement('fcp', fcp, 'millisecond');
        Sentry.setMeasurement('ttfb', ttfb, 'millisecond');
      }
    };

    // Memory usage monitoring
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        
        Sentry.setContext('memory', {
          usedJSHeapSize: memInfo.usedJSHeapSize,
          totalJSHeapSize: memInfo.totalJSHeapSize,
          jsHeapSizeLimit: memInfo.jsHeapSizeLimit
        });
        
        // Alert on high memory usage
        const memoryUsagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
        if (memoryUsagePercent > 90) {
          Sentry.captureMessage(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`, 'warning');
        }
      }
    };

    measureWebVitals();
    monitorMemory();
    
    // Cleanup
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Development mode - show metrics overlay
  if (import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
        <div className="font-bold mb-2">Performance Metrics</div>
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'measuring...'}</div>
        <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'waiting...'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'measuring...'}</div>
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'measuring...'}</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'measuring...'}</div>
      </div>
    );
  }

  return null;
};

// Higher-order component to wrap pages with performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string
) => {
  const ComponentWithPerformanceMonitoring = (props: P) => {
    useEffect(() => {
      // Mark when component is mounted
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Mounted ${pageName}`,
        level: 'info'
      });
    }, []);

    return (
      <>
        <WrappedComponent {...props} />
        <PerformanceMonitor />
      </>
    );
  };
  
  ComponentWithPerformanceMonitoring.displayName = `withPerformanceMonitoring(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithPerformanceMonitoring;
};