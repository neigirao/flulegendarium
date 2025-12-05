import { cn } from "@/lib/utils";
import { memo } from "react";

interface ShimmerSkeletonProps {
  className?: string;
  variant?: "default" | "circle" | "text" | "card" | "image";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const ShimmerSkeleton = memo(({
  className,
  variant = "default",
  width,
  height,
  lines = 1
}: ShimmerSkeletonProps) => {
  const baseClasses = "relative overflow-hidden bg-neutral-200 dark:bg-neutral-800";
  
  const shimmerClasses = cn(
    "absolute inset-0",
    "bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent",
    "animate-shimmer"
  );

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, "h-4 rounded")}
            style={{ width: i === lines - 1 ? "75%" : "100%" }}
          >
            <div className={shimmerClasses} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={cn(baseClasses, "rounded-full", className)}
        style={{ width: width || 40, height: height || 40 }}
      >
        <div className={shimmerClasses} />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("p-4 rounded-lg bg-card border border-border", className)}>
        <div className="flex items-center gap-4">
          <div className={cn(baseClasses, "w-12 h-12 rounded-full")}>
            <div className={shimmerClasses} />
          </div>
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, "h-4 rounded w-3/4")}>
              <div className={shimmerClasses} />
            </div>
            <div className={cn(baseClasses, "h-3 rounded w-1/2")}>
              <div className={shimmerClasses} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "image") {
    return (
      <div
        className={cn(
          baseClasses,
          "rounded-2xl flex items-center justify-center",
          className
        )}
        style={style}
      >
        {/* Shimmer overlay */}
        <div className={shimmerClasses} />
        
        {/* Placeholder icon */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className={cn(baseClasses, "h-3 w-24 rounded")}>
            <div className={shimmerClasses} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, "rounded", className)}
      style={style}
    >
      <div className={shimmerClasses} />
    </div>
  );
});

ShimmerSkeleton.displayName = "ShimmerSkeleton";

// Player Image specific skeleton
export const PlayerImageSkeleton = memo(({ className }: { className?: string }) => (
  <div className={cn("w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto", className)}>
    <div className="relative rounded-3xl overflow-hidden border-4 border-neutral-200 dark:border-neutral-700 p-1">
      <ShimmerSkeleton 
        variant="image" 
        className="w-80 h-80 md:w-96 md:h-96"
      />
      
      {/* Difficulty badge skeleton */}
      <div className="absolute -top-2 -right-2">
        <ShimmerSkeleton className="w-20 h-6 rounded-full" />
      </div>
    </div>
    
    {/* Text skeleton */}
    <div className="text-center mt-4 space-y-2">
      <ShimmerSkeleton className="h-5 w-48 mx-auto rounded" />
      <ShimmerSkeleton className="h-4 w-64 mx-auto rounded" />
    </div>
  </div>
));

PlayerImageSkeleton.displayName = "PlayerImageSkeleton";

// Ranking skeleton
export const RankingSkeleton = memo(({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <ShimmerSkeleton key={i} variant="card" />
    ))}
  </div>
));

RankingSkeleton.displayName = "RankingSkeleton";
