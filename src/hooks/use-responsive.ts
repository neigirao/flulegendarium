
import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
  isXs: boolean;  // < 480px
  isSm: boolean;  // 480px - 768px
  isMd: boolean;  // 768px - 1024px
  isLg: boolean;  // 1024px - 1280px
  isXl: boolean;  // >= 1280px
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1024px
  isDesktop: boolean; // >= 1024px
}

const breakpoints = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1280,
} as const;

export function useResponsive(): ResponsiveBreakpoints {
  const [screenSize, setScreenSize] = useState<ResponsiveBreakpoints>(() => {
    if (typeof window === 'undefined') {
      return {
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
      };
    }

    const width = window.innerWidth;
    return {
      isXs: width < breakpoints.xs,
      isSm: width >= breakpoints.xs && width < breakpoints.sm,
      isMd: width >= breakpoints.sm && width < breakpoints.md,
      isLg: width >= breakpoints.md && width < breakpoints.lg,
      isXl: width >= breakpoints.lg,
      isMobile: width < breakpoints.sm,
      isTablet: width >= breakpoints.sm && width < breakpoints.md,
      isDesktop: width >= breakpoints.md,
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        setScreenSize({
          isXs: width < breakpoints.xs,
          isSm: width >= breakpoints.xs && width < breakpoints.sm,
          isMd: width >= breakpoints.sm && width < breakpoints.md,
          isLg: width >= breakpoints.md && width < breakpoints.lg,
          isXl: width >= breakpoints.lg,
          isMobile: width < breakpoints.sm,
          isTablet: width >= breakpoints.sm && width < breakpoints.md,
          isDesktop: width >= breakpoints.md,
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
}
