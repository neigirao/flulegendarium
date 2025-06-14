
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg'
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const errorAttempts = useRef(0);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
    errorAttempts.current = 0;
  }, [src]);

  const handleLoad = () => {
    console.log(`📸 OptimizedImage loaded successfully: ${currentSrc}`);
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`❌ OptimizedImage error for: ${currentSrc}`);
    errorAttempts.current++;
    
    // Prevent infinite loops by limiting error attempts
    if (errorAttempts.current >= 3) {
      console.error(`🛑 Too many error attempts for: ${currentSrc}`);
      setHasError(true);
      setIsLoaded(false);
      onError?.();
      return;
    }

    // Try fallback only once
    if (currentSrc !== fallbackSrc && errorAttempts.current === 1) {
      console.log(`🔄 Trying fallback for: ${currentSrc} -> ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      setIsLoaded(false);
    }
    
    onError?.();
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {!hasError && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            maxWidth: '100%',
            height: 'auto',
            aspectRatio: width && height ? `${width}/${height}` : undefined
          }}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <div className="text-center">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Escudo do Fluminense" 
              className="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>Imagem não disponível</p>
          </div>
        </div>
      )}
    </div>
  );
};
