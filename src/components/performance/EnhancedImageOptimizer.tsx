import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  isLCPCandidate?: boolean;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  sizes?: string;
}

// Generate WebP/AVIF sources for modern browsers
const generateModernSources = (src: string, width?: number) => {
  const baseUrl = src.includes('lovable-uploads') ? src.split('.')[0] : src;
  const sizes = width ? [width, width * 2] : [400, 800, 1200];
  
  return {
    avif: sizes.map(size => `${baseUrl}?format=avif&w=${size} ${size}w`).join(', '),
    webp: sizes.map(size => `${baseUrl}?format=webp&w=${size} ${size}w`).join(', '),
    fallback: sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ')
  };
};

export const EnhancedImageOptimizer = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  isLCPCandidate = false,
  aspectRatio = '16/9',
  onLoad,
  onError,
  fallbackSrc,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: EnhancedImageOptimizerProps) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate responsive sources
  const sources = generateModernSources(currentSrc, width);

  const handleLoad = useCallback(() => {
    setImageStatus('loaded');
    onLoad?.();
    
    // Report LCP timing for critical images
    if (isLCPCandidate && performance.mark) {
      performance.mark('lcp-image-loaded');
      performance.measure('lcp-image-load-time', 'navigationStart', 'lcp-image-loaded');
      
      // Send LCP data to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        const lcpTime = performance.getEntriesByName('lcp-image-load-time')[0]?.duration;
        if (lcpTime) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lcpTime),
            metric_id: 'lcp-image'
          });
        }
      }
    }
  }, [isLCPCandidate, onLoad]);

  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    setImageStatus('error');
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Intersection Observer for lazy loading (non-priority images)
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            // Start loading the image
            imgRef.current.style.opacity = '1';
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Preload critical images
  useEffect(() => {
    if (priority || isLCPCandidate) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = currentSrc;
      if (sources.avif) {
        preloadLink.type = 'image/avif';
      }
      preloadLink.fetchPriority = 'high';
      document.head.appendChild(preloadLink);

      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [priority, isLCPCandidate, currentSrc, sources.avif]);

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-muted/20',
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Loading skeleton */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 animate-pulse" />
      )}

      {/* Modern image with multiple format support */}
      <picture>
        {/* AVIF for best compression */}
        <source
          srcSet={sources.avif}
          sizes={sizes}
          type="image/avif"
        />
        
        {/* WebP fallback */}
        <source
          srcSet={sources.webp}
          sizes={sizes}
          type="image/webp"
        />
        
        {/* Standard fallback */}
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={sources.fallback}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageStatus === 'loaded' ? 'opacity-100' : priority ? 'opacity-0' : 'opacity-0',
            isLCPCandidate && 'data-lcp-critical'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            contentVisibility: priority ? 'visible' : 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
          }}
        />
      </picture>

      {/* Error state */}
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-flu-grena/20 flex items-center justify-center">
              <span className="text-xs font-bold text-flu-grena">FLU</span>
            </div>
            <p className="text-xs">Imagem indisponível</p>
          </div>
        </div>
      )}

      {/* Performance debug info (development only) */}
      {process.env.NODE_ENV === 'development' && isLCPCandidate && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
          LCP Critical
        </div>
      )}
    </div>
  );
};