import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getTransformedImageUrl, isSupabaseStorageUrl, getResponsiveSrcSet } from '@/utils/image/supabaseTransforms';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

/**
 * Optimized Image component with:
 * - Supabase transforms for resizing/format conversion
 * - Intersection Observer lazy loading
 * - Progressive loading with blur placeholder
 * - Responsive srcset generation
 */
export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 80,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg'
}: OptimizedImageProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get optimized URL
  const optimizedSrc = isSupabaseStorageUrl(src)
    ? getTransformedImageUrl(src, { width, height, quality })
    : src;

  // Generate srcset for Supabase images
  const srcSet = isSupabaseStorageUrl(src)
    ? getResponsiveSrcSet(src)
    : undefined;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, inView]);

  const handleLoad = useCallback(() => {
    setStatus('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setStatus('error');
    onError?.();
  }, [onError]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
      style={{ 
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined
      }}
    >
      {/* Loading placeholder with blur effect */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Actual image */}
      {(inView || priority) && (
        <img
          ref={imgRef}
          src={status === 'error' ? fallbackSrc : optimizedSrc}
          srcSet={status !== 'error' ? srcSet : undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Imagem indisponível</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
