
import React, { lazy, Suspense } from 'react';
import { PlayerImageSkeleton } from '@/components/ui/skeleton-loader';

// Lazy load heavy components

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
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-card/80 backdrop-blur-sm rounded-xl shadow-lg">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary font-semibold">Carregando...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { withLazyPreload } from '@/utils/lazy-preload.tsx';
