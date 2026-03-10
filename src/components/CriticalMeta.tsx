import { useEffect } from 'react';
import { useLCPOptimization } from '@/hooks/performance';

export const CriticalMeta = () => {
  const { optimizeForLCP, measureLCP } = useLCPOptimization();

  useEffect(() => {
    // Apply LCP optimizations (mark critical images, lazy-load non-critical)
    optimizeForLCP();
    const cleanup = measureLCP();

    // Ensure viewport is correct for mobile
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');

    return cleanup;
  }, [optimizeForLCP, measureLCP]);

  return null;
};
