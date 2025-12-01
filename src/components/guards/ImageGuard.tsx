
import { useState, useCallback, memo } from 'react';
import { validateImageUrl } from '@/utils/validation/dataValidators';
import { Loader, AlertTriangle } from 'lucide-react';

interface ImageGuardProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
}

export const ImageGuard = memo(({
  src,
  alt,
  className = '',
  fallbackSrc = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
  onError,
  onLoad,
  priority = false
}: ImageGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Validate and sanitize image URL
  const validation = validateImageUrl(src);
  const imageSrc = validation.isValid ? validation.sanitizedData : fallbackSrc;

  const handleLoad = useCallback(() => {
    console.log('✅ Imagem carregada com sucesso:', imageSrc);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [imageSrc, onLoad]);

  const handleError = useCallback((event?: React.SyntheticEvent<HTMLImageElement>) => {
    // Detect 429 (Too Many Requests) or other external URL failures
    const img = event?.currentTarget;
    const isExternalUrl = imageSrc.startsWith('http://') || imageSrc.startsWith('https://');
    
    console.error('❌ Erro ao carregar imagem:', imageSrc);
    
    if (isExternalUrl && imageSrc !== fallbackSrc) {
      console.warn('⚠️ URL externa falhou (possível 429 ou rate limit). Usando fallback local.');
      setIsLoading(false);
      setHasError(true);
      onError?.();
      return;
    }
    
    setIsLoading(false);
    
    if (retryCount < maxRetries && imageSrc !== fallbackSrc) {
      console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries} para carregar imagem`);
      setRetryCount(prev => prev + 1);
      // Force retry by updating key
      setTimeout(() => setIsLoading(true), 1000);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [imageSrc, fallbackSrc, retryCount, maxRetries, onError]);

  // Show loading state
  if (isLoading && !hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center gap-2 p-4">
          <Loader className="w-6 h-6 text-flu-grena animate-spin" />
          <span className="text-sm text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Show error state (only if using fallback fails too)
  if (hasError && imageSrc === fallbackSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <span className="text-sm text-red-600">Erro ao carregar imagem</span>
        </div>
      </div>
    );
  }

  // Render image
  return (
    <img
      key={`${imageSrc}-${retryCount}`} // Force re-render on retry
      src={hasError ? fallbackSrc : imageSrc}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
});

ImageGuard.displayName = 'ImageGuard';
