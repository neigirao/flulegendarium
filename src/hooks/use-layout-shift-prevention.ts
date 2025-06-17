
import { useRef, useEffect } from 'react';

interface UseLayoutShiftPreventionProps {
  reserveSpace?: boolean;
  aspectRatio?: number;
  minHeight?: number;
}

export const useLayoutShiftPrevention = ({
  reserveSpace = true,
  aspectRatio = 1,
  minHeight = 100
}: UseLayoutShiftPreventionProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reserveSpace || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    
    if (width > 0) {
      const calculatedHeight = Math.max(width / aspectRatio, minHeight);
      container.style.minHeight = `${calculatedHeight}px`;
    }
  }, [reserveSpace, aspectRatio, minHeight]);

  return { containerRef };
};
