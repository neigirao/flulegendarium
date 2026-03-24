
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const SkeletonLoader = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonLoaderProps) => {
  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded animate-pulse"
            style={{
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted animate-pulse",
        variant === 'circular' ? 'rounded-full' : 'rounded',
        className
      )}
      style={{ width, height }}
    />
  );
};

// Skeleton específico para o player image
export const PlayerImageSkeleton = () => (
  <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-muted border-2 border-secondary">
    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-pulse" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-20 h-20 bg-muted-foreground/30 rounded-full animate-pulse" />
    </div>
  </div>
);

// Skeleton para cards de ranking
export const RankingCardSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
    <SkeletonLoader variant="circular" width={40} height={40} />
    <div className="flex-1">
      <SkeletonLoader variant="text" lines={2} />
    </div>
    <SkeletonLoader width={60} height={24} />
  </div>
);
