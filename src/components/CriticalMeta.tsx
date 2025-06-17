
import { useEffect } from 'react';

export const CriticalMeta = () => {
  useEffect(() => {
    // Otimizar viewport para mobile
    const updateViewport = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    };

    // Adicionar resource hints críticos com priorização
    const addResourceHints = () => {
      // Preconnect to critical domains first
      const criticalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      criticalDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // DNS prefetch for non-critical domains
      const prefetchDomains = [
        'https://lovableproject.com',
        'https://www.googletagmanager.com'
      ];

      prefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });

      // Preload critical fonts with higher priority
      const criticalFonts = [
        {
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
          as: 'style'
        }
      ];

      criticalFonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font.href;
        link.as = font.as;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        // Also add the actual stylesheet
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = font.href;
        styleLink.media = 'print';
        styleLink.onload = function() {
          (this as HTMLLinkElement).media = 'all';
        };
        document.head.appendChild(styleLink);
      });

      // Preload critical images
      const criticalImages = [
        '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png' // Fluminense logo
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      });
    };

    // Critical CSS inline otimizado para LCP
    const addCriticalCSS = () => {
      const criticalCSS = `
        /* Critical above-the-fold styles optimized for LCP */
        body { 
          font-family: Inter, system-ui, -apple-system, sans-serif; 
          margin: 0; 
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .min-h-screen { 
          min-height: 100vh; 
          min-height: 100dvh; 
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .bg-gradient-to-b { 
          background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); 
        }
        .from-flu-verde\\/50 { 
          --tw-gradient-from: rgb(0 97 60 / 0.5); 
          --tw-gradient-to: rgb(0 97 60 / 0); 
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); 
        }
        .to-white { --tw-gradient-to: rgb(255 255 255); }
        
        /* Optimize for faster paint */
        .flu-grena { color: #7A0213; }
        .flu-verde { color: #006140; }
        .bg-flu-grena { background-color: #7A0213; }
        .bg-flu-verde { background-color: #006140; }
        
        /* Prevent layout shift for common elements */
        img { height: auto; max-width: 100%; }
        button { cursor: pointer; }
        
        /* Loading states */
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;

      const style = document.createElement('style');
      style.innerHTML = criticalCSS;
      style.setAttribute('data-critical', 'true');
      document.head.appendChild(style);
    };

    // PWA meta tags otimizados
    const addPWAMeta = () => {
      const metas = [
        { name: 'theme-color', content: '#7A0213' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Lendas do Flu' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' } // Prevent iOS from detecting numbers as phone numbers
      ];

      metas.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });

      // Add apple touch icons
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png';
      document.head.appendChild(appleTouchIcon);
    };

    // Performance optimizations
    const addPerformanceOptimizations = () => {
      // Reduce main-thread blocking
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(() => {
          addResourceHints();
          addPWAMeta();
        }, { priority: 'background' });
      } else {
        // Fallback for browsers without scheduler API
        setTimeout(() => {
          addResourceHints();
          addPWAMeta();
        }, 0);
      }
    };

    // Execute critical optimizations immediately
    updateViewport();
    addCriticalCSS();
    
    // Execute non-critical optimizations after initial render
    addPerformanceOptimizations();

    // Cleanup function
    return () => {
      // Remove critical CSS after main CSS loads to reduce memory usage
      setTimeout(() => {
        const criticalStyle = document.querySelector('style[data-critical="true"]');
        if (criticalStyle) {
          criticalStyle.remove();
        }
      }, 3000); // Increased timeout to ensure main CSS is loaded
    };
  }, []);

  return null;
};
