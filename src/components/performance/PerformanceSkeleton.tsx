import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceSkeletonProps {
  className?: string;
  height?: number;
  width?: number | string;
  aspectRatio?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'button';
  animate?: boolean;
}

export const PerformanceSkeleton = memo(({
  className,
  height = 200,
  width = '100%',
  aspectRatio,
  variant = 'rectangular',
  animate = true
}: PerformanceSkeletonProps) => {
  const baseClasses = cn(
    'bg-gray-200',
    animate && 'animate-pulse',
    variant === 'circular' && 'rounded-full',
    variant === 'rectangular' && 'rounded-lg',
    variant === 'text' && 'rounded h-4',
    variant === 'button' && 'rounded-lg h-12',
    className
  );

  const style: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    aspectRatio: aspectRatio || undefined,
    // Performance optimization
    contain: 'layout style paint',
    willChange: animate ? 'transform' : 'auto'
  };

  return (
    <div 
      className={baseClasses}
      style={style}
      role="presentation"
      aria-hidden="true"
      data-skeleton="true"
    />
  );
});

PerformanceSkeleton.displayName = 'PerformanceSkeleton';

// Skeleton específico para ranking (evita CLS)
export const RankingSkeleton = memo(() => (
  <div className="space-y-4 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <PerformanceSkeleton variant="circular" width={40} height={40} />
        <div className="space-y-2">
          <PerformanceSkeleton variant="text" width={120} />
          <PerformanceSkeleton variant="text" width={80} />
        </div>
      </div>
      <PerformanceSkeleton variant="text" width={60} />
    </div>
    
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <PerformanceSkeleton variant="circular" width={32} height={32} />
          <div className="space-y-1">
            <PerformanceSkeleton variant="text" width={100} />
            <PerformanceSkeleton variant="text" width={60} />
          </div>
        </div>
        <PerformanceSkeleton variant="text" width={40} />
      </div>
    ))}
  </div>
));

RankingSkeleton.displayName = 'RankingSkeleton';

// Skeleton para player image (crítico para LCP)
export const PlayerImageSkeleton = memo(({ 
  aspectRatio = '4/5',
  isLCP = false 
}: { 
  aspectRatio?: string;
  isLCP?: boolean;
}) => (
  <div 
    className={cn(
      "relative overflow-hidden rounded-lg bg-gray-200",
      isLCP && "lcp-skeleton-container"
    )}
    style={{ 
      aspectRatio,
      contain: 'layout style paint',
      willChange: 'transform'
    }}
    data-skeleton="player-image"
    data-lcp={isLCP}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
    
    {/* Fluminense placeholder */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-gray-400 text-xs font-bold">FLU</span>
      </div>
    </div>
    
    {isLCP && (
      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
        LCP
      </div>
    )}
  </div>
));

PlayerImageSkeleton.displayName = 'PlayerImageSkeleton';