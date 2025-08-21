import { cn } from '@/lib/utils';

interface UnifiedSkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'player-image' | 'card' | 'ranking';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

export const UnifiedSkeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animated = true
}: UnifiedSkeletonProps) => {
  const baseClasses = cn(
    "bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30",
    animated && "animate-pulse",
    className
  );

  // Text skeleton with multiple lines
  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, "h-4 rounded")}
            style={{
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  // Player image specific skeleton
  if (variant === 'player-image') {
    return (
      <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-muted/10 border-2 border-primary">
        <div className={cn(baseClasses, "absolute inset-0")} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-20 h-20 bg-muted/40 rounded-full flex items-center justify-center",
            animated && "animate-pulse"
          )}>
            <div className="text-xs font-bold text-muted-foreground">FLU</div>
          </div>
        </div>
      </div>
    );
  }

  // Card skeleton (generic card layout)
  if (variant === 'card') {
    return (
      <div className="p-4 space-y-3 bg-card rounded-lg border">
        <div className={cn(baseClasses, "h-4 rounded w-3/4")} />
        <div className={cn(baseClasses, "h-3 rounded w-1/2")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-2 rounded")} />
          <div className={cn(baseClasses, "h-2 rounded w-5/6")} />
        </div>
      </div>
    );
  }

  // Ranking item skeleton
  if (variant === 'ranking') {
    return (
      <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border shadow-sm">
        <div className={cn(baseClasses, "w-10 h-10 rounded-full")} />
        <div className="flex-1 space-y-2">
          <div className={cn(baseClasses, "h-4 rounded w-1/2")} />
          <div className={cn(baseClasses, "h-3 rounded w-1/3")} />
        </div>
        <div className={cn(baseClasses, "w-16 h-6 rounded")} />
      </div>
    );
  }

  // Default rectangular/circular skeleton
  return (
    <div
      className={cn(
        baseClasses,
        variant === 'circular' ? 'rounded-full' : 'rounded'
      )}
      style={{ width, height }}
    />
  );
};

// Specialized skeleton components
export const PlayerImageSkeleton = () => (
  <UnifiedSkeleton variant="player-image" />
);

export const RankingCardSkeleton = () => (
  <UnifiedSkeleton variant="ranking" />
);

export const TextSkeleton = ({ lines = 2 }: { lines?: number }) => (
  <UnifiedSkeleton variant="text" lines={lines} />
);

export const CardSkeleton = () => (
  <UnifiedSkeleton variant="card" />
);