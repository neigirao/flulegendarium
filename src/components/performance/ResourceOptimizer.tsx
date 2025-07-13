import { useEffect } from 'react';
import { BundleOptimizer } from '@/utils/performance/bundleOptimizer';
import { CacheStrategy } from '@/utils/performance/cacheStrategy';

export const ResourceOptimizer = () => {
  useEffect(() => {
    // Add preload links for critical resources
    const preloadLinks = BundleOptimizer.generatePreloadLinks();
    
    preloadLinks.forEach(linkConfig => {
      const link = document.createElement('link');
      Object.entries(linkConfig).forEach(([key, value]) => {
        link.setAttribute(key, String(value));
      });
      document.head.appendChild(link);
    });

    // Optimize font loading
    const optimizeFonts = () => {
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach(link => {
        (link as HTMLLinkElement).setAttribute('display', 'swap');
      });
    };

    // Remove unused CSS after page load
    const removeUnusedCSS = () => {
      setTimeout(() => {
        // Remove critical CSS that was inlined
        const criticalStyle = document.querySelector('style[data-critical="true"]');
        if (criticalStyle) {
          criticalStyle.remove();
        }
      }, 3000);
    };

    // Defer non-critical JavaScript
    const deferNonCriticalJS = () => {
      const scripts = document.querySelectorAll('script[data-defer="true"]');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.getAttribute('data-src') || '';
        newScript.defer = true;
        document.head.appendChild(newScript);
      });
    };

    optimizeFonts();
    removeUnusedCSS();
    deferNonCriticalJS();

    // Service Worker registration for caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return null;
};