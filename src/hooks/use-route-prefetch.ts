import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Route prefetch configuration
 * Maps current routes to likely next routes for prefetching
 */
const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  '/': ['/selecionar-modo-jogo', '/auth'],
  '/selecionar-modo-jogo': ['/quiz-adaptativo', '/quiz-decada', '/quiz-camisas'],
  '/quiz-adaptativo': ['/selecionar-modo-jogo', '/perfil', '/conquistas'],
  '/quiz-decada': ['/selecionar-modo-jogo', '/perfil'],
  '/quiz-camisas': ['/selecionar-modo-jogo', '/perfil'],
  '/auth': ['/selecionar-modo-jogo', '/perfil'],
  '/perfil': ['/selecionar-modo-jogo', '/conquistas'],
  '/noticias': ['/noticias/:slug'],
};

/**
 * Lazy module imports for prefetching
 */
const ROUTE_MODULES: Record<string, () => Promise<unknown>> = {
  '/selecionar-modo-jogo': () => import('@/pages/GameModeSelection'),
  // '/quiz-adaptativo' and '/quiz-decada' are statically imported in App.tsx
  // and therefore don't benefit from dynamic prefetch imports.
  '/quiz-camisas': () => import('@/pages/JerseyQuizPage'),
  '/auth': () => import('@/pages/Auth'),
  '/perfil': () => import('@/pages/ProfilePage'),
  '/conquistas': () => import('@/pages/Conquistas'),
  '/noticias': () => import('@/pages/NewsPortal'),
  '/faq': () => import('@/pages/FAQ'),
  '/tutorial': () => import('@/pages/Tutorial'),
  '/doacoes': () => import('@/pages/Donations'),
  '/social': () => import('@/pages/SocialPage'),
  '/desafios': () => import('@/pages/DailyChallengesPage'),
};

/**
 * Prefetch a route's module using dynamic import
 */
function prefetchRoute(route: string): void {
  const moduleLoader = ROUTE_MODULES[route];
  if (!moduleLoader) return;

  // Use requestIdleCallback for non-blocking prefetch
  const doPrefetch = () => {
    moduleLoader()
      .then(() => {
        logger.debug(`Route prefetched: ${route}`, 'PREFETCH');
      })
      .catch(() => {
        // Silent fail - prefetch is best-effort
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(doPrefetch, { timeout: 3000 });
  } else {
    setTimeout(doPrefetch, 200);
  }
}

/**
 * Hook that prefetches likely next routes based on current location
 */
export function useRoutePrefetch(): void {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const routesToPrefetch = ROUTE_PREFETCH_MAP[currentPath] || [];

    if (routesToPrefetch.length === 0) return;

    // Delay prefetch to not interfere with current page load
    const timer = setTimeout(() => {
      routesToPrefetch.forEach(route => {
        // Skip dynamic routes with params
        if (!route.includes(':')) {
          prefetchRoute(route);
        }
      });
    }, 1500); // Wait 1.5s after navigation

    return () => clearTimeout(timer);
  }, [location.pathname]);
}

/**
 * Manual prefetch trigger for link hover
 */
export function useLinkPrefetch() {
  const handleMouseEnter = useCallback((route: string) => {
    prefetchRoute(route);
  }, []);

  return { onMouseEnter: handleMouseEnter };
}

/**
 * Prefetch on link visibility (intersection observer)
 */
export function usePrefetchOnVisible(route: string, ref: React.RefObject<HTMLElement>): void {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            prefetchRoute(route);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [route, ref]);
}
