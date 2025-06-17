
import { useState, useCallback, memo } from 'react';
import { useLayoutShiftPrevention } from '@/hooks/use-layout-shift-prevention';
import { cn } from '@/lib/utils';

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const MobileOptimizedImage = memo(({
  src,
  alt,
  className,
  aspectRatio = 1,
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
}: MobileOptimizedImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  const { containerRef } = useLayoutShiftPrevention({
    reserveSpace: true,
    aspectRatio,
    minHeight: 200
  });

  const handleImageLoad = useCallback(() => {
    console.log('📸 MobileOptimizedImage loaded:', currentSrc);
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  }, [currentSrc, onLoad]);

  const handleImageError = useCallback(() => {
    console.error('❌ MobileOptimizedImage error:', currentSrc);
    
    if (currentSrc !== fallbackSrc) {
      console.log('🔄 Trying fallback:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setImageError(false);
    } else {
      console.log('💥 Fallback also failed');
      setImageError(true);
    }
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Generate srcset for different screen densities
  const generateSrcSet = useCallback((baseSrc: string) => {
    if (baseSrc.includes('lovable-uploads')) {
      return `${baseSrc} 1x, ${baseSrc} 2x`;
    }
    return baseSrc;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-gray-100 rounded-lg',
        'transition-all duration-300',
        className
      )}
      style={{ aspectRatio: aspectRatio.toString() }}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200">
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 bg-gray-300 rounded-full animate-spin border-2 border-t-flu-grena"></div>
          </div>
        </div>
      )}

      {/* Image */}
      {!imageError && (
        <img
          key={currentSrc} // Force re-render when src changes
          src={currentSrc}
          srcSet={generateSrcSet(currentSrc)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className={cn(
            'w-full h-full object-contain transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            willChange: imageLoaded ? 'auto' : 'opacity'
          }}
        />
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4">
          <img 
            src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
            alt="Escudo do Fluminense" 
            className="w-16 h-16 mb-2 opacity-50"
          />
          <p className="text-sm text-center">Imagem não disponível</p>
        </div>
      )}

      {/* Loading indicator for slow connections */}
      {!imageLoaded && !imageError && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Carregando...
        </div>
      )}
    </div>
  );
});

MobileOptimizedImage.displayName = 'MobileOptimizedImage';
