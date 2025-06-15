
import { useEffect, useCallback } from 'react';
import { useDeviceDetection } from './use-device-detection';

export const useMobilePerformance = () => {
  const { isMobile, connectionType, devicePixelRatio } = useDeviceDetection();

  // Optimize for mobile performance
  useEffect(() => {
    if (!isMobile) return;

    // Reduce animations on slow connections
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    // Optimize rendering for high DPI displays
    if (devicePixelRatio > 2) {
      // Enable hardware acceleration for critical elements
      const criticalElements = document.querySelectorAll('.animate-spin, .transition-all');
      criticalElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'transform';
      });
    }

    // Prevent over-scrolling on iOS
    document.body.style.overscrollBehavior = 'none';

    // Improve touch performance
    document.body.style.touchAction = 'manipulation';

    return () => {
      document.documentElement.style.removeProperty('--animation-duration');
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
    };
  }, [isMobile, connectionType, devicePixelRatio]);

  // Memory management for mobile
  const optimizeMemoryUsage = useCallback(() => {
    if (!isMobile) return;

    // Clean up unused resources
    const cleanupImages = () => {
      const images = document.querySelectorAll('img[data-loaded="false"]');
      images.forEach(img => {
        if (img.getBoundingClientRect().top > window.innerHeight * 2) {
          (img as HTMLImageElement).src = '';
        }
      });
    };

    // Throttle cleanup to avoid performance issues
    let cleanupTimeout: NodeJS.Timeout;
    const throttledCleanup = () => {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = setTimeout(cleanupImages, 1000);
    };

    window.addEventListener('scroll', throttledCleanup, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledCleanup);
      clearTimeout(cleanupTimeout);
    };
  }, [isMobile]);

  // Battery optimization
  const optimizeBatteryUsage = useCallback(() => {
    if (!isMobile || !('getBattery' in navigator)) return;

    (navigator as any).getBattery?.().then((battery: any) => {
      const handleBatteryChange = () => {
        if (battery.level < 0.2 && !battery.charging) {
          // Reduce performance on low battery
          document.documentElement.classList.add('low-battery-mode');
        } else {
          document.documentElement.classList.remove('low-battery-mode');
        }
      };

      battery.addEventListener('levelchange', handleBatteryChange);
      battery.addEventListener('chargingchange', handleBatteryChange);
      handleBatteryChange();

      return () => {
        battery.removeEventListener('levelchange', handleBatteryChange);
        battery.removeEventListener('chargingchange', handleBatteryChange);
      };
    }).catch(() => {
      // Battery API not supported
    });
  }, [isMobile]);

  useEffect(() => {
    const cleanupMemory = optimizeMemoryUsage();
    optimizeBatteryUsage();

    return cleanupMemory;
  }, [optimizeMemoryUsage, optimizeBatteryUsage]);

  return {
    isMobileOptimized: isMobile,
    connectionType,
    devicePixelRatio
  };
};
