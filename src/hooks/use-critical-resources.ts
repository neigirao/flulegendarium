
import { useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface CriticalResource {
  href: string;
  as: string;
  type?: string;
  crossorigin?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
}

export const useCriticalResources = () => {
  // Preload critical images for LCP improvement
  const preloadCriticalImages = useCallback(() => {
    const criticalImages = [
      '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', // Fluminense logo
      '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png', // Game banner
    ];

    criticalImages.forEach((src, index) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      link.fetchPriority = index === 0 ? 'high' : 'low';
      link.crossOrigin = 'anonymous';
      
      // Avoid duplicate preloads
      const existing = document.querySelector(`link[href="${src}"]`);
      if (!existing) {
        document.head.appendChild(link);
        logger.debug(`Preloading critical image: ${src}`, 'CRITICAL_RESOURCES');
      }
    });
  }, []);

  // Preload critical fonts
  const preloadCriticalFonts = useCallback(() => {
    const fonts = [
      {
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        as: 'style',
        crossorigin: 'anonymous'
      }
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font.href;
      link.as = font.as;
      link.crossOrigin = font.crossorigin;
      
      const existing = document.querySelector(`link[href="${font.href}"][rel="preload"]`);
      if (!existing) {
        document.head.appendChild(link);
        logger.debug(`Preloading critical font: ${font.href}`, 'CRITICAL_RESOURCES');
      }
    });
  }, []);

  // Optimize resource hints
  const optimizeResourceHints = useCallback(() => {
    const domains = [
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { href: 'https://fonts.gstatic.com', rel: 'preconnect' },
      { href: 'https://www.googletagmanager.com', rel: 'dns-prefetch' },
    ];

    domains.forEach(domain => {
      const existing = document.querySelector(`link[href="${domain.href}"][rel="${domain.rel}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = domain.rel;
        link.href = domain.href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        logger.debug(`Adding resource hint: ${domain.rel} -> ${domain.href}`, 'CRITICAL_RESOURCES');
      }
    });
  }, []);

  // Lazy load non-critical resources
  const loadNonCriticalResources = useCallback(() => {
    const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
    
    requestIdle(() => {
      // Preload common player images in background
      const commonPlayerImages = [
        '/lovable-uploads/16398385-eef5-4e38-b90a-39630732acba.png',
        '/lovable-uploads/16f7afff-6bba-4b39-a454-daa6c2373151.png',
      ];

      commonPlayerImages.forEach((src, index) => {
        setTimeout(() => {
          const img = new Image();
          img.fetchPriority = 'low';
          img.src = src;
          logger.debug(`Background preloading: ${src}`, 'CRITICAL_RESOURCES');
        }, index * 500);
      });
    });
  }, []);

  useEffect(() => {
    // Execute critical resource preloads immediately
    preloadCriticalImages();
    preloadCriticalFonts();
    optimizeResourceHints();
    
    // Schedule non-critical resources for later
    setTimeout(loadNonCriticalResources, 2000);
  }, [preloadCriticalImages, preloadCriticalFonts, optimizeResourceHints, loadNonCriticalResources]);

  return {
    preloadCriticalImages,
    preloadCriticalFonts,
    optimizeResourceHints,
    loadNonCriticalResources
  };
};
