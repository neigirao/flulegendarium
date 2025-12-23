import { useRoutePrefetch } from '@/hooks/use-route-prefetch';

/**
 * Provider component that enables route prefetching
 * Must be placed inside BrowserRouter
 */
export function RoutePrefetchProvider({ children }: { children: React.ReactNode }) {
  useRoutePrefetch();
  return <>{children}</>;
}
