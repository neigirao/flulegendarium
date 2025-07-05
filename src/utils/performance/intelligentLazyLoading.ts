import { lazy, ComponentType } from 'react';

interface LazyLoadingOptions {
  preload?: boolean;
  fallback?: ComponentType;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface ModuleMetrics {
  loadTime: number;
  size: number;
  usage: number;
}

class IntelligentLazyLoader {
  private moduleMetrics = new Map<string, ModuleMetrics>();
  private preloadQueue = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();

  // Intelligent lazy loading with usage analytics
  createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    moduleName: string,
    options: LazyLoadingOptions = {}
  ) {
    const startTime = performance.now();
    
    const LazyComponent = lazy(async () => {
      const loadStart = performance.now();
      
      try {
        const module = await importFn();
        const loadTime = performance.now() - loadStart;
        
        // Track metrics
        this.updateModuleMetrics(moduleName, {
          loadTime,
          size: this.estimateModuleSize(module),
          usage: this.getUsageCount(moduleName) + 1
        });
        
        return module;
      } catch (error) {
        console.error(`❌ Failed to load module ${moduleName}:`, error);
        throw error;
      }
    });

    // Preload based on priority and usage patterns
    if (options.preload || this.shouldPreload(moduleName, options.priority)) {
      this.schedulePreload(importFn, moduleName);
    }

    return LazyComponent;
  }

  // Smart preloading based on user behavior
  private shouldPreload(moduleName: string, priority?: string): boolean {
    const metrics = this.moduleMetrics.get(moduleName);
    
    // Preload high-priority or frequently used modules
    if (priority === 'high') return true;
    if (metrics && metrics.usage > 3) return true;
    
    // Preload if user is likely to navigate to this module
    if (this.predictUserNavigation(moduleName)) return true;
    
    return false;
  }

  // Predict user navigation patterns
  private predictUserNavigation(moduleName: string): boolean {
    // Simple heuristic: preload admin modules if user has admin patterns
    if (moduleName.includes('admin') && this.hasAdminActivity()) {
      return true;
    }
    
    // Preload game modules during peak hours
    if (moduleName.includes('game') && this.isPeakGameTime()) {
      return true;
    }
    
    return false;
  }

  // Schedule intelligent preloading
  private schedulePreload(importFn: () => Promise<any>, moduleName: string) {
    if (this.preloadQueue.has(moduleName)) return;
    
    this.preloadQueue.add(moduleName);
    
    // Use requestIdleCallback for non-blocking preloading
    const preload = () => {
      if (!this.loadingPromises.has(moduleName)) {
        const promise = importFn().catch(err => {
          console.warn(`⚠️ Preload failed for ${moduleName}:`, err);
        });
        this.loadingPromises.set(moduleName, promise);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload, { timeout: 5000 });
    } else {
      setTimeout(preload, 100);
    }
  }

  // Update module usage metrics
  private updateModuleMetrics(moduleName: string, metrics: ModuleMetrics) {
    this.moduleMetrics.set(moduleName, metrics);
    
    // Persist metrics to localStorage for cross-session optimization
    const allMetrics = Object.fromEntries(this.moduleMetrics);
    localStorage.setItem('module-metrics', JSON.stringify(allMetrics));
  }

  // Estimate module size (rough heuristic)
  private estimateModuleSize(module: any): number {
    try {
      return JSON.stringify(module).length;
    } catch {
      return 1000; // fallback estimate
    }
  }

  // Get usage count from storage
  private getUsageCount(moduleName: string): number {
    try {
      const stored = localStorage.getItem('module-metrics');
      if (stored) {
        const metrics = JSON.parse(stored);
        return metrics[moduleName]?.usage || 0;
      }
    } catch {
      // ignore storage errors
    }
    return 0;
  }

  // Check for admin activity patterns
  private hasAdminActivity(): boolean {
    return document.cookie.includes('admin') || 
           window.location.pathname.includes('admin') ||
           localStorage.getItem('user-role') === 'admin';
  }

  // Check if it's peak game time
  private isPeakGameTime(): boolean {
    const hour = new Date().getHours();
    // Peak hours: 7-9 AM, 12-14 PM, 19-22 PM
    return (hour >= 7 && hour <= 9) || 
           (hour >= 12 && hour <= 14) || 
           (hour >= 19 && hour <= 22);
  }

  // Clean up unused modules from cache
  cleanupUnusedModules() {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    this.moduleMetrics.forEach((metrics, moduleName) => {
      if (metrics.usage === 0 && metrics.loadTime < cutoffTime) {
        this.moduleMetrics.delete(moduleName);
        this.loadingPromises.delete(moduleName);
      }
    });
  }

  // Get performance report
  getPerformanceReport() {
    const report = {
      totalModules: this.moduleMetrics.size,
      averageLoadTime: 0,
      mostUsedModules: [] as string[],
      preloadedModules: this.preloadQueue.size
    };

    const metrics = Array.from(this.moduleMetrics.values());
    if (metrics.length > 0) {
      report.averageLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
    }

    // Sort modules by usage
    const sortedModules = Array.from(this.moduleMetrics.entries())
      .sort(([,a], [,b]) => b.usage - a.usage)
      .slice(0, 5)
      .map(([name]) => name);
    
    report.mostUsedModules = sortedModules;

    return report;
  }
}

// Singleton instance
export const intelligentLazyLoader = new IntelligentLazyLoader();

// Convenience functions for common lazy loading patterns
export const createOptimizedLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  moduleName: string,
  options?: LazyLoadingOptions
) => {
  return intelligentLazyLoader.createLazyComponent(importFn, moduleName, options);
};

// Prebuilt optimized lazy components for commonly used modules
export const LazyGameContainer = createOptimizedLazy(
  () => import('@/components/guess-game/GameContainer').then(m => ({ default: m.GameContainer })),
  'GameContainer',
  { priority: 'high', preload: true }
);

export const LazyDecadeGame = createOptimizedLazy(
  () => import('@/components/decade-game/DecadeGameContainer').then(m => ({ default: m.DecadeGameContainer })),
  'DecadeGame',
  { priority: 'high' }
);

// Performance monitoring
if (typeof window !== 'undefined') {
  // Clean up every hour
  setInterval(() => {
    intelligentLazyLoader.cleanupUnusedModules();
  }, 60 * 60 * 1000);

  // Log performance report in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      console.log('📊 Lazy Loading Performance Report:', 
        intelligentLazyLoader.getPerformanceReport());
    }, 5000);
  }
}