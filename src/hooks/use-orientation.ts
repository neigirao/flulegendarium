
import { useState, useEffect } from 'react';

export type OrientationType = 'portrait' | 'landscape';

export interface OrientationState {
  orientation: OrientationType;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

export function useOrientation(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>(() => {
    if (typeof window === 'undefined') {
      return {
        orientation: 'portrait',
        angle: 0,
        isPortrait: true,
        isLandscape: false,
      };
    }

    const angle = screen.orientation?.angle || (window as any).orientation || 0;
    const isLandscape = Math.abs(angle) === 90;
    
    return {
      orientation: isLandscape ? 'landscape' : 'portrait',
      angle,
      isPortrait: !isLandscape,
      isLandscape,
    };
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      // Small delay to ensure screen dimensions are updated
      setTimeout(() => {
        const angle = screen.orientation?.angle || (window as any).orientation || 0;
        const isLandscape = Math.abs(angle) === 90;
        
        setOrientation({
          orientation: isLandscape ? 'landscape' : 'portrait',
          angle,
          isPortrait: !isLandscape,
          isLandscape,
        });
      }, 100);
    };

    // Modern browsers
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }
    
    // Fallback for older browsers
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}
