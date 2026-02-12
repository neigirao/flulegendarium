import React, { Suspense, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PerformanceSkeleton } from '@/components/performance/PerformanceSkeleton';

interface LazyLoadProps {
  fallback?: React.ReactNode;
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  children: React.ReactNode;
}

const DefaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="bg-error-light border border-error/30 rounded-lg p-6 max-w-md">
      <h3 className="text-lg font-semibold text-error mb-2">
        Erro ao carregar componente
      </h3>
      <p className="text-error/80 mb-4">
        {error.message || 'Falha ao carregar o módulo'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-error text-error-foreground px-4 py-2 rounded hover:bg-error/90 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

export const LazyLoad: React.FC<LazyLoadProps> = ({
  fallback = <PerformanceSkeleton height={400} />,
  errorFallback: ErrorFallback = DefaultErrorFallback,
  children
}) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { withLazyLoad, createLazyComponent } from '@/utils/lazy-load-utils.tsx';
