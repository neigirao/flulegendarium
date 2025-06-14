
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  onLoad,
  onError
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{ width, height }}
    >
      {isInView && (
        <>
          <img
            ref={imgRef}
            src={src}
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
          
          {!isLoaded && !hasError && (
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
        </>
      )}
      
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};
