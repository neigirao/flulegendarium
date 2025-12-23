
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
  isLCPCandidate?: boolean;
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
  fallbackSrc = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
  isLCPCandidate = false
}: CriticalImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Aggressive preload for LCP candidates
  useEffect(() => {
    if (isLCPCandidate && src) {
      console.log('🚀 LCP: Preloading critical image immediately:', src);
      
      // Create high priority preload
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      link.fetchPriority = 'high';
      link.crossOrigin = 'anonymous';
      
      // Check if already exists
      const existing = document.querySelector(`link[href="${src}"][rel="preload"]`);
      if (!existing) {
        document.head.appendChild(link);
      }
      
      // Also preload the image directly
      const img = new Image();
      img.fetchPriority = 'high';
      img.decoding = 'sync'; // Synchronous decoding for LCP
      img.src = src;
      
      img.onload = () => {
        console.log('✅ LCP: Critical image preloaded successfully:', src);
      };
      
      img.onerror = () => {
        console.warn('⚠️ LCP: Critical image preload failed:', src);
      };
    }
  }, [src, isLCPCandidate]);

  const handleLoad = useCallback(() => {
    console.log(`🖼️ ${isLCPCandidate ? 'LCP ' : ''}Critical image loaded:`, currentSrc);
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
    
    // Report LCP if this is a candidate
    if (isLCPCandidate) {
      console.log('📊 LCP: Reporting successful load of critical image');
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lcp_image_loaded', {
          event_category: 'Performance',
          event_label: 'critical_image',
          value: performance.now()
        });
      }
    }
  }, [currentSrc, onLoad, isLCPCandidate]);

  const handleError = useCallback(() => {
    console.error(`❌ ${isLCPCandidate ? 'LCP ' : ''}Critical image error:`, currentSrc);
    
    if (currentSrc !== fallbackSrc) {
      console.log('🔄 Switching to fallback image');
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    
    onError?.();
  }, [currentSrc, fallbackSrc, onError, isLCPCandidate]);

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
      className={cn(
        'relative overflow-hidden',
        isLCPCandidate && 'lcp-banner-container performance-optimized',
        className
      )}
      style={containerStyle}
    >
      {/* Reserve space to prevent layout shift */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ aspectRatio: aspectRatio }}
        />
      )}

      {/* Optimized image */}
      {!hasError && (
        <img
          key={currentSrc}
          src={currentSrc}
          srcSet={generateSrcSet(currentSrc)}
          sizes={isLCPCandidate ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          alt={alt}
          width={width}
          height={height}
          loading={priority || isLCPCandidate ? 'eager' : 'lazy'}
          decoding={isLCPCandidate ? 'sync' : 'async'}
          fetchPriority={priority || isLCPCandidate ? 'high' : 'auto'}
          data-lcp-critical={isLCPCandidate ? 'true' : 'false'}
          className={cn(
            'w-full h-full object-contain transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isLCPCandidate && 'performance-optimized'
          )}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            contentVisibility: priority || isLCPCandidate ? 'visible' : 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto',
            ...(isLCPCandidate && {
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            })
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
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

      {/* LCP Debug info in development */}
      {process.env.NODE_ENV === 'development' && isLCPCandidate && (
        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
          LCP CRITICAL
        </div>
      )}
    </div>
  );
});

CriticalImage.displayName = 'CriticalImage';
