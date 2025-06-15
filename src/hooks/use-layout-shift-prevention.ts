
import { useEffect, useRef } from 'react';

interface UseLayoutShiftPreventionOptions {
  reserveSpace?: boolean;
  minHeight?: number;
  aspectRatio?: number;
}

export const useLayoutShiftPrevention = (options: UseLayoutShiftPreventionOptions = {}) => {
  const { reserveSpace = true, minHeight = 200, aspectRatio } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !reserveSpace) return;

    const container = containerRef.current;
    
    // Set initial dimensions to prevent layout shift
    if (!hasLoaded.current) {
      if (aspectRatio) {
        const width = container.offsetWidth || 300;
        const height = width / aspectRatio;
        container.style.minHeight = `${Math.max(height, minHeight)}px`;
      } else {
        container.style.minHeight = `${minHeight}px`;
      }
    }

    // Observer for when content loads
    const observer = new MutationObserver(() => {
      if (!hasLoaded.current && container.children.length > 0) {
        hasLoaded.current = true;
        // Gradually remove reserved space after content loads
        setTimeout(() => {
          container.style.minHeight = '';
        }, 100);
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [reserveSpace, minHeight, aspectRatio]);

  return {
    containerRef,
    isLoaded: hasLoaded.current
  };
};
