import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  supportsTouch: boolean;
  supportsWebP: boolean;
  connectionType: string;
  devicePixelRatio: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        isChrome: false,
        isFirefox: false,
        isEdge: false,
        supportsTouch: false,
        supportsWebP: false,
        connectionType: 'unknown',
        devicePixelRatio: 1,
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    const isTablet = /tablet|ipad/.test(userAgent) || (isAndroid && !/mobile/.test(userAgent));
    
    // Browser detection
    const isSafari = /safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent);
    const isChrome = /chrome|chromium/.test(userAgent) && !/edg/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isEdge = /edg/.test(userAgent);

    // Feature detection
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // WebP support detection
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    // Connection type - use type assertion for Navigator extension
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const connectionType = connection?.effectiveType || 'unknown';

    return {
      isMobile: isMobile && !isTablet,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      isEdge,
      supportsTouch,
      supportsWebP,
      connectionType,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  });

  useEffect(() => {
    // Re-detect on resize (for cases where device orientation changes behavior)
    const handleResize = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isTablet = /tablet|ipad/.test(userAgent) || (userAgent.includes('android') && !/mobile/.test(userAgent));
      
      setDeviceInfo(prev => ({
        ...prev,
        isMobile: isMobile && !isTablet,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        devicePixelRatio: window.devicePixelRatio || 1,
      }));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}
