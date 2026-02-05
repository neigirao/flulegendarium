import { useState, useEffect, useCallback } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useMobileOptimization = () => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [touchOptimized, setTouchOptimized] = useState(false);

  const updateViewportInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Get safe area insets for mobile devices
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaInsets = {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
    };

    setViewportInfo({
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width > height ? 'landscape' : 'portrait',
      safeAreaInsets
    });
  }, []);

  // Detect virtual keyboard on mobile
  useEffect(() => {
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Keyboard is likely open if height decreased by more than 150px
      setIsKeyboardOpen(heightDifference > 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => window.removeEventListener('resize', handleViewportChange);
    }
  }, []);

  // Detect touch optimization
  useEffect(() => {
    const checkTouchSupport = () => {
      setTouchOptimized(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints !== undefined && (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints! > 0
      );
    };

    checkTouchSupport();
  }, []);

  // Update viewport info on resize
  useEffect(() => {
    updateViewportInfo();
    window.addEventListener('resize', updateViewportInfo);
    window.addEventListener('orientationchange', updateViewportInfo);

    return () => {
      window.removeEventListener('resize', updateViewportInfo);
      window.removeEventListener('orientationchange', updateViewportInfo);
    };
  }, [updateViewportInfo]);

  // Apply CSS custom properties for safe areas
  useEffect(() => {
    if (viewportInfo.isMobile) {
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${viewportInfo.height}px`
      );
      document.documentElement.style.setProperty(
        '--safe-area-inset-top',
        `${viewportInfo.safeAreaInsets.top}px`
      );
      document.documentElement.style.setProperty(
        '--safe-area-inset-bottom',
        `${viewportInfo.safeAreaInsets.bottom}px`
      );
    }
  }, [viewportInfo]);

  const getResponsiveClasses = useCallback((base: string, mobile?: string, tablet?: string) => {
    let classes = base;
    if (mobile && viewportInfo.isMobile) classes += ` ${mobile}`;
    if (tablet && viewportInfo.isTablet) classes += ` ${tablet}`;
    return classes;
  }, [viewportInfo.isMobile, viewportInfo.isTablet]);

  const getTouchTargetSize = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    if (!touchOptimized) return '';
    
    const sizes = {
      small: 'min-h-[44px] min-w-[44px]',
      medium: 'min-h-[48px] min-w-[48px]',
      large: 'min-h-[56px] min-w-[56px]'
    };
    
    return sizes[size];
  }, [touchOptimized]);

  return {
    viewportInfo,
    isKeyboardOpen,
    touchOptimized,
    getResponsiveClasses,
    getTouchTargetSize,
  };
};