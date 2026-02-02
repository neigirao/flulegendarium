import React, { ComponentType } from 'react';
import { LazyLoad } from '@/components/LazyLoad';

// Higher-order component for lazy loading
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <LazyLoad fallback={fallback}>
      <Component {...props} />
    </LazyLoad>
  );
  
  WrappedComponent.displayName = `withLazyLoad(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Utility for creating lazy components with better error handling
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn);
  
  const WrappedComponent = (props: P) => (
    <LazyLoad fallback={fallback}>
      <LazyComponent {...props} />
    </LazyLoad>
  );
  
  WrappedComponent.displayName = 'LazyComponent';
  return WrappedComponent;
}
