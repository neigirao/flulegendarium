import React, { lazy } from 'react';
import { LazyWrapper } from '@/components/LazyComponents';

// Simplified higher-order component for lazy loading with preloading
export function withLazyPreload<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  preloadTrigger?: () => boolean
) {
  const LazyComponent = lazy(importFn);
  
  // Preload component when trigger condition is met
  if (preloadTrigger && preloadTrigger()) {
    importFn();
  }
  
  const WrappedComponent = React.forwardRef<HTMLElement, P>((props, ref) => (
    <LazyWrapper>
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ));
  
  WrappedComponent.displayName = 'LazyPreloadedComponent';
  
  return WrappedComponent;
}
