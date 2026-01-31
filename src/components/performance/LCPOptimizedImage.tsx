import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  getTransformedImageUrl, 
  isSupabaseStorageUrl, 
  getResponsiveSrcSet 
} from '@/utils/image/supabaseTransforms';

interface LCPOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  aspectRatio?: '1/1' | '4/3' | '3/4' | '16/9' | '9/16';
}

// Responsive breakpoints for srcset
const SRCSET_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536];

/**
 * LCP-Optimized Image component with:
 * - Native browser lazy loading
 * - Responsive srcset for optimal image sizes
 * - Supabase Storage transforms for WebP/AVIF
 * - Fixed dimensions for CLS prevention
 * - fetchpriority="high" for LCP images
 * - Intersection Observer fallback for older browsers
 */
export const LCPOptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  quality = 80,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  aspectRatio = '4/3'
}: LCPOptimizedImageProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get optimized URL with Supabase transforms
  const optimizedSrc = isSupabaseStorageUrl(src)
    ? getTransformedImageUrl(src, { width, height, quality, format: 'webp' })
    : src;

  // Generate responsive srcset
  const srcSet = isSupabaseStorageUrl(src)
    ? SRCSET_WIDTHS
        .filter(w => !width || w <= width * 2) // Only generate sizes up to 2x the display size
        .map(w => {
          const url = getTransformedImageUrl(src, { 
            width: w, 
            quality: w <= 640 ? 70 : quality,
            format: 'webp'
          });
          return `${url} ${w}w`;
        })
        .join(', ')
    : undefined;

  // Intersection Observer for lazy loading (fallback for older browsers)
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
      { 
        rootMargin: '200px 0px', // Start loading 200px before visible
        threshold: 0.01 
      }
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

  // Aspect ratio styles for CLS prevention
  const aspectRatioStyles: Record<string, string> = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '16/9': 'aspect-video',
    '9/16': 'aspect-[9/16]'
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioStyles[aspectRatio],
        containerClassName
      )}
      style={{ 
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
        // CLS prevention: reserve space
        contain: 'layout paint style'
      }}
    >
      {/* Loading placeholder with shimmer effect */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Actual image - only render when in viewport */}
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
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            className
          )}
          // LCP optimization attributes
          data-lcp-critical={priority ? 'true' : undefined}
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

LCPOptimizedImage.displayName = 'LCPOptimizedImage';

/**
 * Preload critical images for LCP optimization
 * Call this in RootLayout or page components for hero images
 */
export function preloadCriticalImage(
  src: string, 
  options: { width?: number; quality?: number } = {}
): void {
  if (typeof window === 'undefined') return;
  
  const { width = 1200, quality = 80 } = options;
  
  const optimizedUrl = isSupabaseStorageUrl(src)
    ? getTransformedImageUrl(src, { width, quality, format: 'webp' })
    : src;

  // Use link preload for browser-native optimization
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  link.fetchPriority = 'high';
  
  // Add srcset hint for responsive images
  if (isSupabaseStorageUrl(src)) {
    link.imageSrcset = getResponsiveSrcSet(src, [640, 1024, 1280]);
    link.imageSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
  
  document.head.appendChild(link);
}

/**
 * Preload multiple images with priority ordering
 */
export function preloadImageBatch(
  urls: string[],
  options: { priority?: 'high' | 'low'; maxConcurrent?: number } = {}
): void {
  const { priority = 'low', maxConcurrent = 3 } = options;
  
  urls.slice(0, maxConcurrent).forEach((url, index) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        preloadCriticalImage(url, { 
          quality: priority === 'high' ? 80 : 70 
        });
      }, { timeout: index * 100 + 50 });
    } else {
      setTimeout(() => {
        preloadCriticalImage(url, { 
          quality: priority === 'high' ? 80 : 70 
        });
      }, index * 100);
    }
  });
}
