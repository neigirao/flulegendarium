
import { lazy, Suspense } from 'react';
import { PlayerImageSkeleton } from '@/components/ui/skeleton-loader';

// Lazy load heavy components
export const LazyUserProfile = lazy(() => 
  import('@/components/UserProfile').then(module => ({ default: module.UserProfile }))
);

export const LazyAdminDashboard = lazy(() => 
  import('@/components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);

export const LazyPlayerRanking = lazy(() => 
  import('@/components/PlayerRanking').then(module => ({ default: module.PlayerRanking }))
);

// Wrapper component for lazy loading with optimized suspense
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper = ({ children, fallback }: LazyWrapperProps) => {
  const defaultFallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
        <p className="text-flu-grena font-semibold">Carregando...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Simplified higher-order component for lazy loading with preloading
export const withLazyPreload = <P extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  preloadTrigger?: () => boolean
) => {
  const LazyComponent = lazy(importFn);
  
  // Preload component when trigger condition is met
  if (preloadTrigger && preloadTrigger()) {
    importFn();
  }
  
  const WrappedComponent = (props: P) => (
    <LazyWrapper>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
  
  WrappedComponent.displayName = 'LazyPreloadedComponent';
  
  return WrappedComponent;
};
