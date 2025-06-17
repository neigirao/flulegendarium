
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

    // Adicionar resource hints críticos
    const addResourceHints = () => {
      // Preload critical fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'font';
      fontPreload.type = 'font/woff2';
      fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
      fontPreload.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreload);

      // Preconnect to important domains
      const preconnects = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://lovableproject.com'
      ];

      preconnects.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Critical CSS inline para above-the-fold
    const addCriticalCSS = () => {
      const criticalCSS = `
        /* Critical above-the-fold styles */
        body { font-family: Inter, system-ui, sans-serif; margin: 0; }
        .min-h-screen { min-height: 100vh; min-height: 100dvh; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }
        .from-flu-verde\/50 { --tw-gradient-from: rgb(0 97 60 / 0.5); --tw-gradient-to: rgb(0 97 60 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
        .to-white { --tw-gradient-to: rgb(255 255 255); }
      `;

      const style = document.createElement('style');
      style.innerHTML = criticalCSS;
      style.setAttribute('data-critical', 'true');
      document.head.appendChild(style);
    };

    // PWA meta tags
    const addPWAMeta = () => {
      const metas = [
        { name: 'theme-color', content: '#7A0213' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Lendas do Flu' },
        { name: 'mobile-web-app-capable', content: 'yes' }
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

    updateViewport();
    addResourceHints();
    addCriticalCSS();
    addPWAMeta();

    // Cleanup function
    return () => {
      // Remove critical CSS after main CSS loads
      setTimeout(() => {
        const criticalStyle = document.querySelector('style[data-critical="true"]');
        if (criticalStyle) {
          criticalStyle.remove();
        }
      }, 2000);
    };
  }, []);

  return null;
};
