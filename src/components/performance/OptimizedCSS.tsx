
import { useEffect } from 'react';

export const OptimizedCSS = () => {
  useEffect(() => {
    // Load non-critical CSS asynchronously
    const loadCSS = (href: string, media = 'all') => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print'; // Load as print to avoid blocking
      link.onload = function() {
        (this as HTMLLinkElement).media = media;
      };
      document.head.appendChild(link);
    };

    // Remove unused CSS imports and load them conditionally
    const removeUnusedStyles = () => {
      // Remove any existing duplicate stylesheets
      const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
      const hrefs = new Set();
      
      existingLinks.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        if (hrefs.has(href)) {
          link.remove();
        } else {
          hrefs.add(href);
        }
      });
    };

    // Optimize font loading
    const optimizeFonts = () => {
      const fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
      if (fontLink) {
        (fontLink as HTMLLinkElement).setAttribute('media', 'print');
        (fontLink as HTMLLinkElement).onload = function() {
          (this as HTMLLinkElement).media = 'all';
        };
      }
    };

    // Execute optimizations
    removeUnusedStyles();
    optimizeFonts();

    // Clean up critical CSS after page load
    const criticalStyle = document.querySelector('style[data-critical="true"]');
    if (criticalStyle) {
      setTimeout(() => {
        criticalStyle.remove();
      }, 3000);
    }
  }, []);

  return null;
};
