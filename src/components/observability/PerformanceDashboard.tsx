import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Globe, 
  Server, 
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null; 
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  } | null;
  networkRequests: number;
  cacheHitRate: number;
  bundleSize: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    memoryUsage: null,
    networkRequests: 0,
    cacheHitRate: 0,
    bundleSize: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or for admins
    const shouldShow = import.meta.env.DEV || localStorage.getItem('show-perf-dashboard') === 'true';
    setIsVisible(shouldShow);

    if (!shouldShow) return;

    // Collect Web Vitals
    const collectWebVitals = () => {
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1].startTime;
        setMetrics(prev => ({ ...prev, lcp }));
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = (entries[0] as any).processingStart - entries[0].startTime;
        setMetrics(prev => ({ ...prev, fid }));
      }).observe({ type: 'first-input', buffered: true });

      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      }).observe({ type: 'layout-shift', buffered: true });

      // Memory
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        }));
      }

      // Network requests
      const observer = new PerformanceObserver((list) => {
        const requests = list.getEntries().filter(entry => 
          entry.entryType === 'resource' || entry.entryType === 'navigation'
        ).length;
        setMetrics(prev => ({ ...prev, networkRequests: prev.networkRequests + requests }));
      });
      observer.observe({ entryTypes: ['resource', 'navigation'] });
    };

    collectWebVitals();

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getScoreColor = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return 'gray';
    if (value <= thresholds.good) return 'green';
    if (value <= thresholds.poor) return 'yellow';
    return 'red';
  };

  const getScoreIcon = (value: number | null, thresholds: { good: number; poor: number }) => {
    const color = getScoreColor(value, thresholds);
    if (color === 'green') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (color === 'yellow') return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    if (color === 'red') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Performance Dashboard
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-3 mt-4">
            {/* LCP */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                {getScoreIcon(metrics.lcp, { good: 2500, poor: 4000 })}
                <span className="text-sm font-medium">LCP</span>
              </div>
              <Badge variant={getScoreColor(metrics.lcp, { good: 2500, poor: 4000 }) as any}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Measuring...'}
              </Badge>
            </div>

            {/* FID */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                {getScoreIcon(metrics.fid, { good: 100, poor: 300 })}
                <span className="text-sm font-medium">FID</span>
              </div>
              <Badge variant={getScoreColor(metrics.fid, { good: 100, poor: 300 }) as any}>
                {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Waiting...'}
              </Badge>
            </div>

            {/* CLS */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                {getScoreIcon(metrics.cls, { good: 0.1, poor: 0.25 })}
                <span className="text-sm font-medium">CLS</span>
              </div>
              <Badge variant={getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 }) as any}>
                {metrics.cls ? metrics.cls.toFixed(3) : 'Measuring...'}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-3 mt-4">
            {metrics.memoryUsage && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>JS Heap Used</span>
                    <span>{(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <Progress 
                    value={(metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>Total Heap</div>
                    <div className="font-medium">{(metrics.memoryUsage.total / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>Heap Limit</div>
                    <div className="font-medium">{(metrics.memoryUsage.limit / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="network" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>Requests</span>
                <span className="font-medium">{metrics.networkRequests}</span>
              </div>
              
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>Cache Hit Rate</span>
                <span className="font-medium">{metrics.cacheHitRate}%</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          💡 Performance metrics for development
        </div>
      </div>
    </div>
  );
};