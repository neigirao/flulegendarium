
import { useState, useCallback, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface CriticalImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const CriticalImage = memo(({
  src,
  alt,
  className,
  priority = true,
  width,
  height,
  aspectRatio,
  onLoad,
  onError,
  fallbackSrc = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
}: CriticalImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Preload critical images immediately
  useEffect(() => {
    if (priority && src) {
      const img = new Image();
      img.fetchPriority = 'high';
      img.src = src;
      
      img.onload = () => {
        console.log('✅ Critical image preloaded:', src);
      };
      
      img.onerror = () => {
        console.warn('⚠️ Critical image preload failed:', src);
      };
    }
  }, [src, priority]);

  const handleLoad = useCallback(() => {
    console.log('🖼️ Critical image loaded:', currentSrc);
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [currentSrc, onLoad]);

  const handleError = useCallback(() => {
    console.error('❌ Critical image error:', currentSrc);
    
    if (currentSrc !== fallbackSrc) {
      console.log('🔄 Switching to fallback image');
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Generate responsive srcset for better performance
  const generateSrcSet = useCallback((imageSrc: string) => {
    if (imageSrc.includes('lovable-uploads')) {
      return `${imageSrc} 1x, ${imageSrc} 2x`;
    }
    return imageSrc;
  }, []);

  const containerStyle = {
    aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  };

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
    >
      {/* Reserve space to prevent layout shift */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ aspectRatio: aspectRatio }}
        />
      )}

      {/* Optimized image */}
      {!hasError && (
        <img
          key={currentSrc}
          src={currentSrc}
          srcSet={generateSrcSet(currentSrc)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className={cn(
            'w-full h-full object-contain transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            contentVisibility: priority ? 'visible' : 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500">
          <div className="text-center p-4">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Escudo do Fluminense" 
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              loading="lazy"
            />
            <p className="text-sm">Imagem indisponível</p>
          </div>
        </div>
      )}
    </div>
  );
});

CriticalImage.displayName = 'CriticalImage';
