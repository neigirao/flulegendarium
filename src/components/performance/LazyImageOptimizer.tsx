import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  sizes?: string;
  placeholder?: 'blur' | 'skeleton' | 'none';
}

export const LazyImageOptimizer = memo(({
  src,
  alt,
  className,
  width,
  height,
  aspectRatio = '16:9',
  priority = false,
  onLoad,
  onError,
  fallbackSrc,
  sizes = '100vw',
  placeholder = 'skeleton'
}: LazyImageOptimizerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate responsive srcSet
  const generateSrcSet = (imageSrc: string) => {
    if (!imageSrc) return '';
    
    const baseUrl = imageSrc.split('?')[0];
    const params = new URLSearchParams(imageSrc.split('?')[1] || '');
    
    const widths = [320, 640, 768, 1024, 1280, 1920];
    
    return widths.map(w => {
      params.set('w', w.toString());
      params.set('q', '80');
      return `${baseUrl}?${params.toString()} ${w}w`;
    }).join(', ');
  };

  // Generate modern format sources
  const generateModernSources = (imageSrc: string) => {
    if (!imageSrc) return { avif: '', webp: '' };
    
    const baseUrl = imageSrc.split('?')[0];
    const params = new URLSearchParams(imageSrc.split('?')[1] || '');
    
    const avifParams = new URLSearchParams(params);
    avifParams.set('format', 'avif');
    avifParams.set('q', '60');
    
    const webpParams = new URLSearchParams(params);
    webpParams.set('format', 'webp');
    webpParams.set('q', '75');
    
    return {
      avif: `${baseUrl}?${avifParams.toString()}`,
      webp: `${baseUrl}?${webpParams.toString()}`
    };
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || currentSrc) return;

    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, priority, currentSrc]);

  // Preload critical images
  useEffect(() => {
    if (!priority) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    
    const modernSources = generateModernSources(src);
    if (modernSources.avif) {
      link.imageSrcset = generateSrcSet(modernSources.avif);
    }
    
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    onError?.();
  };

  const modernSources = generateModernSources(currentSrc);
  const srcSet = generateSrcSet(currentSrc);

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        !isLoaded && placeholder === 'skeleton' && "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse",
        className
      )}
      style={{ 
        aspectRatio: aspectRatio,
        minHeight: height || 'auto'
      }}
      data-prevent-cls
    >
      {/* Placeholder while loading */}
      {!isLoaded && placeholder === 'skeleton' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded" />
            <span className="text-xs">Imagem não encontrada</span>
          </div>
        </div>
      )}

      {/* Optimized image with modern formats */}
      {currentSrc && !hasError && (
        <picture>
          {/* AVIF format for maximum compression */}
          {modernSources.avif && (
            <source
              srcSet={generateSrcSet(modernSources.avif)}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* WebP format as fallback */}
          {modernSources.webp && (
            <source
              srcSet={generateSrcSet(modernSources.webp)}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Original format as final fallback */}
          <img
            ref={imgRef}
            src={currentSrc}
            srcSet={srcSet}
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
              "w-full h-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              priority && "data-lcp-critical"
            )}
            style={{ aspectRatio }}
          />
        </picture>
      )}

      {/* Loading indicator for non-skeleton placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
});

LazyImageOptimizer.displayName = 'LazyImageOptimizer';