
import { useEffect, useCallback, useRef } from 'react';
import { useDeviceDetection } from './use-device-detection';

interface PerformanceConfig {
  enableAnimations: boolean;
  imageQuality: 'high' | 'medium' | 'low';
  prefetchImages: boolean;
  reducedMotion: boolean;
}

export const useMobilePerformance = () => {
  const { isMobile, connectionType, devicePixelRatio } = useDeviceDetection();
  const configRef = useRef<PerformanceConfig | null>(null);
  const cleanupFunctions = useRef<(() => void)[]>([]);

  // Determine optimal performance configuration
  const getPerformanceConfig = useCallback((): PerformanceConfig => {
    const isSlowConnection = connectionType === 'slow-2g' || connectionType === '2g';
    const isLowEndDevice = devicePixelRatio <= 1 || navigator.hardwareConcurrency <= 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      enableAnimations: !isSlowConnection && !prefersReducedMotion,
      imageQuality: isSlowConnection || isLowEndDevice ? 'low' : devicePixelRatio > 2 ? 'high' : 'medium',
      prefetchImages: !isSlowConnection,
      reducedMotion: prefersReducedMotion || isSlowConnection
    };
  }, [connectionType, devicePixelRatio]);

  // Apply performance optimizations
  const applyOptimizations = useCallback((config: PerformanceConfig) => {
    const cleanups: (() => void)[] = [];

    // Animation optimizations
    if (!config.enableAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0.05s');
      document.documentElement.style.setProperty('--transition-duration', '0.05s');
      
      cleanups.push(() => {
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--transition-duration');
      });
    }

    // Reduced motion
    if (config.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
      
      cleanups.push(() => {
        document.documentElement.classList.remove('reduce-motion');
      });
    }

    // Hardware acceleration for critical elements
    if (isMobile && devicePixelRatio > 1) {
      const criticalElements = document.querySelectorAll('.animate-spin, .transition-all, [data-critical-animation]');
      criticalElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'transform';
        (el as HTMLElement).style.backfaceVisibility = 'hidden';
      });

      cleanups.push(() => {
        criticalElements.forEach(el => {
          (el as HTMLElement).style.willChange = '';
          (el as HTMLElement).style.backfaceVisibility = '';
        });
      });
    }

    // Mobile-specific optimizations
    if (isMobile) {
      // Prevent over-scrolling
      document.body.style.overscrollBehavior = 'none';
      
      // Improve touch performance
      document.body.style.touchAction = 'manipulation';
      
      // Optimize scrolling
      document.documentElement.style.scrollBehavior = config.enableAnimations ? 'smooth' : 'auto';

      cleanups.push(() => {
        document.body.style.overscrollBehavior = '';
        document.body.style.touchAction = '';
        document.documentElement.style.scrollBehavior = '';
      });
    }

    return cleanups;
  }, [isMobile, devicePixelRatio]);

  // Memory management for mobile
  const optimizeMemoryUsage = useCallback(() => {
    if (!isMobile) return () => {};

    const cleanupImages = () => {
      const images = document.querySelectorAll('img:not([data-priority="high"])');
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Unload images that are far from viewport
        if (rect.top > viewportHeight * 3 || rect.bottom < -viewportHeight * 2) {
          const originalSrc = (img as HTMLImageElement).src;
          if (originalSrc && !originalSrc.includes('data:')) {
            (img as HTMLImageElement).dataset.originalSrc = originalSrc;
            (img as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
          }
        }
      });
    };

    let timeoutId: NodeJS.Timeout;
    const throttledCleanup = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(cleanupImages, 1000);
    };

    // Use passive listeners for better performance
    window.addEventListener('scroll', throttledCleanup, { passive: true });
    window.addEventListener('resize', throttledCleanup, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledCleanup);
      window.removeEventListener('resize', throttledCleanup);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  // Battery optimization
  const optimizeBatteryUsage = useCallback(() => {
    if (!isMobile || !('getBattery' in navigator)) return () => {};

    let cleanup = () => {};

    (navigator as any).getBattery?.().then((battery: any) => {
      const handleBatteryChange = () => {
        const isLowBattery = battery.level < 0.2 && !battery.charging;
        
        if (isLowBattery) {
          document.documentElement.classList.add('low-battery-mode');
          // Reduce performance in low battery mode
          document.documentElement.style.setProperty('--animation-duration', '0.1s');
        } else {
          document.documentElement.classList.remove('low-battery-mode');
          document.documentElement.style.removeProperty('--animation-duration');
        }
      };

      battery.addEventListener('levelchange', handleBatteryChange);
      battery.addEventListener('chargingchange', handleBatteryChange);
      handleBatteryChange();

      cleanup = () => {
        battery.removeEventListener('levelchange', handleBatteryChange);
        battery.removeEventListener('chargingchange', handleBatteryChange);
      };
    }).catch(() => {
      // Battery API not supported
    });

    return cleanup;
  }, [isMobile]);

  // Main effect to apply all optimizations
  useEffect(() => {
    const config = getPerformanceConfig();
    configRef.current = config;

    // Apply optimizations
    const optimizationCleanups = applyOptimizations(config);
    const memoryCleanup = optimizeMemoryUsage();
    const batteryCleanup = optimizeBatteryUsage();

    // Store all cleanup functions
    cleanupFunctions.current = [
      ...optimizationCleanups,
      memoryCleanup,
      batteryCleanup
    ];

    console.log('🚀 Mobile performance optimized:', config);

    return () => {
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, [getPerformanceConfig, applyOptimizations, optimizeMemoryUsage, optimizeBatteryUsage]);

  return {
    isMobileOptimized: isMobile,
    connectionType,
    devicePixelRatio,
    performanceConfig: configRef.current,
    reapplyOptimizations: () => {
      const config = getPerformanceConfig();
      const cleanups = applyOptimizations(config);
      cleanupFunctions.current.push(...cleanups);
    }
  };
};
