import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [resourceUsage, setResourceUsage] = useState<any>(null);
  const { checkPerformanceBudget } = usePerformanceMonitor();

  useEffect(() => {
    // Collect Core Web Vitals
    const collectMetrics = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        const collectedMetrics: PerformanceMetric[] = [];

        [onCLS, onINP, onFCP, onLCP, onTTFB].forEach(metric => {
          metric((data) => {
            const thresholds = {
              CLS: { good: 0.1, poor: 0.25 },
              INP: { good: 200, poor: 500 },
              FCP: { good: 1800, poor: 3000 },
              LCP: { good: 2500, poor: 4000 },
              TTFB: { good: 800, poor: 1800 }
            };

            const threshold = thresholds[data.name as keyof typeof thresholds];
            let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
            
            if (data.value > threshold.poor) rating = 'poor';
            else if (data.value > threshold.good) rating = 'needs-improvement';

            collectedMetrics.push({
              name: data.name,
              value: data.value,
              rating,
              threshold
            });

            setMetrics([...collectedMetrics]);
          });
        });
      } catch (error) {
        console.error('Failed to load web-vitals:', error);
      }
    };

    // Collect resource usage
    const collectResourceUsage = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const usage = {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        largestResource: resources.reduce((max, r) => 
          (r.transferSize || 0) > (max.transferSize || 0) ? r : max, resources[0]
        ),
        slowestResource: resources.reduce((max, r) => 
          r.duration > max.duration ? r : max, resources[0]
        )
      };

      setResourceUsage(usage);
    };

    collectMetrics();
    setTimeout(collectResourceUsage, 2000);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Core Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div key={metric.name} className="flex justify-between items-center">
                  <span className="font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{metric.value.toFixed(2)}</span>
                    <Badge className={getRatingColor(metric.rating)}>
                      {metric.rating}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {resourceUsage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resource Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Resources</span>
                  <span>{resourceUsage.totalResources}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Size</span>
                  <span>{(resourceUsage.totalSize / 1024 / 1024).toFixed(2)}MB</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Largest: {(resourceUsage.largestResource?.transferSize / 1024).toFixed(2)}KB</div>
                  <div>Slowest: {resourceUsage.slowestResource?.duration.toFixed(2)}ms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button 
                onClick={checkPerformanceBudget}
                className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm hover:bg-primary/90"
              >
                Check Performance Budget
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-secondary text-secondary-foreground rounded px-4 py-2 text-sm hover:bg-secondary/90"
              >
                Reload & Re-measure
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};