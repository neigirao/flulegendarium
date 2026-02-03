import React, { ComponentType, Suspense } from 'react';

interface LazyLoadFallbackProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const LazyLoadWrapper = ({ fallback, children }: LazyLoadFallbackProps) => (
  <Suspense fallback={fallback || <div className="animate-pulse bg-muted h-32 rounded-lg" />}>
    {children}
  </Suspense>
);

/**
 * Higher-order component for lazy loading existing components.
 * Wraps any component with a Suspense boundary.
 */
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <LazyLoadWrapper fallback={fallback}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Component {...(props as any)} />
    </LazyLoadWrapper>
  );
  
  WrappedComponent.displayName = `withLazyLoad(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

/**
 * Utility for creating lazy-loaded components from dynamic imports.
 * Provides a simplified API for React.lazy with automatic Suspense wrapping.
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn);
  
  const WrappedComponent = (props: P) => (
    <LazyLoadWrapper fallback={fallback}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LazyComponent {...(props as any)} />
    </LazyLoadWrapper>
  );
  
  WrappedComponent.displayName = 'LazyComponent';
  return WrappedComponent;
}
