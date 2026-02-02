
import { useEffect } from 'react';
import { useLCPOptimization } from '@/hooks/performance';

export const CriticalMeta = () => {
  const { optimizeForLCP } = useLCPOptimization();

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

    // OPTIMIZED: Minimal critical CSS inline
    const addCriticalCSS = () => {
      const criticalCSS = `
        /* Minimal critical styles for LCP optimization */
        body{font-family:Inter,system-ui,-apple-system,sans-serif;margin:0;line-height:1.5;-webkit-font-smoothing:antialiased}
        .min-h-screen{min-height:100vh;min-height:100dvh}
        .flex{display:flex}
        .items-center{align-items:center}
        .justify-center{justify-content:center}
        .bg-gradient-to-b{background-image:linear-gradient(to bottom,var(--tw-gradient-stops))}
        .from-flu-verde\\/50{--tw-gradient-from:rgb(0 97 60/0.5);--tw-gradient-to:rgb(0 97 60/0);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}
        .to-white{--tw-gradient-to:rgb(255 255 255)}
        .flu-grena{color:#7A0213}
        .flu-verde{color:#006140}
        .bg-flu-grena{background-color:#7A0213}
        .bg-flu-verde{background-color:#006140}
        img[data-critical="true"]{content-visibility:visible;contain-intrinsic-size:400px 500px}
        .lcp-container{aspect-ratio:4/5;contain:layout style paint}
        img{height:auto;max-width:100%}
        button{cursor:pointer}
        .animate-spin{animation:spin 1s linear infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        .performance-optimized{transform:translateZ(0);backface-visibility:hidden}
      `;

      const style = document.createElement('style');
      style.innerHTML = criticalCSS;
      style.setAttribute('data-critical', 'true');
      style.setAttribute('data-optimized', 'minimal');
      document.head.appendChild(style);
    };

    // OPTIMIZED: Minimal resource hints
    const addResourceHints = () => {
      // Only essential preconnects
      const criticalDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      criticalDomains.forEach(domain => {
        const existing = document.querySelector(`link[href="${domain}"][rel="preconnect"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });

      // Preload only LCP candidate images
      const lcpImages = [
        '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png' // Game banner - most likely LCP
      ];

      lcpImages.forEach((src) => {
        const existing = document.querySelector(`link[href="${src}"][rel="preload"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = src;
          link.as = 'image';
          link.fetchPriority = 'high';
          document.head.appendChild(link);
        }
      });
    };

    // OPTIMIZED: Minimal PWA meta tags
    const addPWAMeta = () => {
      const metas = [
        { name: 'theme-color', content: '#7A0213' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' }
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
    };

    // Execute critical optimizations immediately
    updateViewport();
    addCriticalCSS();
    optimizeForLCP();
    
    // Execute non-critical optimizations after initial render
    const scheduler = window.scheduler;
    if (scheduler && 'postTask' in scheduler) {
      scheduler.postTask(() => {
        addResourceHints();
        addPWAMeta();
      }, { priority: 'background' });
    } else {
      setTimeout(() => {
        addResourceHints();
        addPWAMeta();
      }, 100);
    }

    // Keep critical CSS - do not remove
    return () => {
      // No cleanup needed - critical CSS should persist
    };
  }, [optimizeForLCP]);

  return null;
};
