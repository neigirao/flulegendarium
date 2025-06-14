
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  onLoad,
  onError,
  fallback
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate WebP source with fallback
  const generateWebPSrc = (originalSrc: string) => {
    if (originalSrc.includes('data:') || originalSrc.includes('.svg')) {
      return originalSrc;
    }
    
    // For external URLs, we can't reliably convert to WebP, so return original
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // For local images, check if WebP version exists
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpSrc !== originalSrc ? webpSrc : originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Set source when in view
  useEffect(() => {
    if (isInView && src) {
      const webpSrc = generateWebPSrc(src);
      setCurrentSrc(webpSrc);
    }
  }, [isInView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== src && !hasError) {
      // Try fallback to original format if WebP fails
      setCurrentSrc(src);
      return;
    }
    
    if (fallback && currentSrc !== fallback) {
      // Try provided fallback
      setCurrentSrc(fallback);
      return;
    }
    
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{ width, height }}
    >
      {isInView && currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          className={cn(
            'transition-opacity duration-300 w-full h-full object-cover',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'hidden'
          )}
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
        />
      )}
      
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-flu-grena border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Imagem não disponível</div>
          </div>
        </div>
      )}
      
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};
