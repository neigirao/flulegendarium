import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface IntelligentImageLoaderProps {
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
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataURL?: string;
}

// Detectar suporte a formatos modernos
const supportsWebP = (() => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

const supportsAVIF = (() => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
})();

// Otimizar URL para diferentes formatos
const getOptimizedSrc = (src: string, format?: 'webp' | 'avif') => {
  if (!format) return src;
  
  // Se é uma imagem do Lovable, usar parâmetros de otimização
  if (src.includes('lovable-uploads')) {
    const hasQuery = src.includes('?');
    return `${src}${hasQuery ? '&' : '?'}format=${format}&quality=85`;
  }
  
  return src;
};

// Gerar srcset responsivo
const generateSrcSet = (src: string, format?: 'webp' | 'avif', sizes: number[] = [400, 800, 1200]) => {
  return sizes
    .map(size => {
      const optimizedSrc = getOptimizedSrc(src, format);
      const hasQuery = optimizedSrc.includes('?');
      return `${optimizedSrc}${hasQuery ? '&' : '?'}w=${size} ${size}w`;
    })
    .join(', ');
};

export const IntelligentImageLoader = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  isLCPCandidate = false,
  aspectRatio = 'auto',
  onLoad,
  onError,
  fallbackSrc,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'skeleton',
  blurDataURL
}: IntelligentImageLoaderProps) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || inView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Carregar 50px antes de entrar na viewport
        threshold: 0.01
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [priority, inView]);

  // Preload para imagens críticas
  useEffect(() => {
    if ((priority || isLCPCandidate) && inView) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      
      if (supportsAVIF) {
        link.href = getOptimizedSrc(currentSrc, 'avif');
        link.type = 'image/avif';
      } else if (supportsWebP) {
        link.href = getOptimizedSrc(currentSrc, 'webp');
        link.type = 'image/webp';
      } else {
        link.href = currentSrc;
      }
      
      link.fetchPriority = 'high';
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, isLCPCandidate, currentSrc, inView]);

  const handleLoad = useCallback(() => {
    setImageStatus('loaded');
    onLoad?.();
    
    // Performance tracking para imagens LCP
    if (isLCPCandidate && typeof performance !== 'undefined') {
      performance.mark('lcp-image-loaded');
      
      // Report to web vitals
      if (typeof window !== 'undefined' && window.gtag) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = performance.now() - navigation.loadEventStart;
        
        window.gtag('event', 'lcp_image_load', {
          value: Math.round(loadTime),
          custom_parameter: 'intelligent_loader'
        });
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

  // Placeholder blur effect
  const blurStyle = placeholder === 'blur' && blurDataURL ? {
    backgroundImage: `url(${blurDataURL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        aspectRatio !== 'auto' && `aspect-[${aspectRatio.replace('/', '\\/')}]`,
        className
      )}
      style={{
        aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined,
        ...blurStyle
      }}
    >
      {/* Skeleton loader */}
      {imageStatus === 'loading' && placeholder === 'skeleton' && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 animate-pulse" />
      )}

      {/* Blur placeholder fade out */}
      {placeholder === 'blur' && imageStatus === 'loaded' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
      )}

      {/* Image with modern format support */}
      {inView && (
        <picture>
          {/* AVIF - best compression */}
          {supportsAVIF && (
            <source
              srcSet={generateSrcSet(currentSrc, 'avif')}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* WebP - good compression */}
          {supportsWebP && (
            <source
              srcSet={generateSrcSet(currentSrc, 'webp')}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback */}
          <img
            src={getOptimizedSrc(currentSrc)}
            srcSet={generateSrcSet(currentSrc)}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-500',
              imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0',
              isLCPCandidate && 'will-change-transform'
            )}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority || isLCPCandidate ? 'high' : 'auto'}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              contentVisibility: priority ? 'visible' : 'auto',
              containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
            }}
          />
        </picture>
      )}

      {/* Error state */}
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
          <div className="text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">FLU</span>
            </div>
            <p className="text-xs">Imagem indisponível</p>
          </div>
        </div>
      )}

      {/* Performance debug indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 right-1 flex gap-1">
          {isLCPCandidate && (
            <span className="px-1 py-0.5 bg-red-500 text-white text-xs rounded">LCP</span>
          )}
          {priority && (
            <span className="px-1 py-0.5 bg-green-500 text-white text-xs rounded">PRI</span>
          )}
          {supportsAVIF && (
            <span className="px-1 py-0.5 bg-blue-500 text-white text-xs rounded">AVIF</span>
          )}
          {supportsWebP && !supportsAVIF && (
            <span className="px-1 py-0.5 bg-yellow-500 text-white text-xs rounded">WebP</span>
          )}
        </div>
      )}
    </div>
  );
};