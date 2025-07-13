import { useEffect } from 'react';

interface ResourceHint {
  rel: string;
  href: string;
  as?: string;
  type?: string;
  crossorigin?: string;
  media?: string;
}

export const useResourceHints = () => {
  useEffect(() => {
    // Critical resource hints
    const hints: ResourceHint[] = [
      // Preconnect to external domains
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      
      // DNS prefetch for potential resources
      { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
      { rel: 'dns-prefetch', href: 'https://static.hotjar.com' },
      
      // Preload critical fonts
      { 
        rel: 'preload', 
        href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      }
    ];

    // Add hints to document head
    hints.forEach(hint => {
      const existingHint = document.querySelector(`link[href="${hint.href}"][rel="${hint.rel}"]`);
      if (!existingHint) {
        const link = document.createElement('link');
        Object.entries(hint).forEach(([key, value]) => {
          if (value) link.setAttribute(key, value);
        });
        document.head.appendChild(link);
      }
    });

    // Preload next likely page based on user behavior
    const preloadNextPage = () => {
      const currentPath = window.location.pathname;
      let nextPageUrl = '';

      switch (currentPath) {
        case '/':
          nextPageUrl = '/guess-player';
          break;
        case '/guess-player':
          nextPageUrl = '/admin';
          break;
        default:
          return;
      }

      if (nextPageUrl) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = nextPageUrl;
        document.head.appendChild(prefetchLink);
      }
    };

    // Delay prefetch to avoid competing with critical resources
    setTimeout(preloadNextPage, 2000);

  }, []);
};