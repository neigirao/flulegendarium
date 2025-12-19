
import { useState, useCallback, memo, useEffect } from 'react';
import { validateImageUrl } from '@/utils/validation/dataValidators';
import { Loader, AlertTriangle } from 'lucide-react';
import { 
  isProblematicDomain, 
  isUrlProblematic, 
  markUrlAsProblematic,
  getRetryDelay 
} from '@/utils/player-image/problematicUrls';
import { logger } from '@/utils/logger';

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
  let imageSrc = validation.isValid ? validation.sanitizedData : fallbackSrc;
  
  // Se a URL é de domínio problemático ou está no cache, usar fallback imediatamente
  const isExternalUrl = imageSrc.startsWith('http://') || imageSrc.startsWith('https://');
  if (isExternalUrl && imageSrc !== fallbackSrc) {
    if (isProblematicDomain(imageSrc) || isUrlProblematic(imageSrc)) {
      logger.warn(`⚠️ URL externa problemática detectada. Usando fallback: ${imageSrc}`);
      imageSrc = fallbackSrc;
    }
  }

  const handleLoad = useCallback(() => {
    logger.info('✅ Imagem carregada com sucesso:', imageSrc);
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0); // Reset retry count on success
    onLoad?.();
  }, [imageSrc, onLoad]);

  const handleError = useCallback((event?: React.SyntheticEvent<HTMLImageElement>) => {
    const isExternalUrl = imageSrc.startsWith('http://') || imageSrc.startsWith('https://');
    
    logger.error('❌ Erro ao carregar imagem:', imageSrc);
    
    // Se é URL externa, marcar como problemática e usar fallback
    if (isExternalUrl && imageSrc !== fallbackSrc) {
      markUrlAsProblematic(imageSrc);
      logger.warn('⚠️ URL externa falhou. Usando fallback local.');
      setIsLoading(false);
      setHasError(true);
      onError?.();
      return;
    }
    
    setIsLoading(false);
    
    // Retry com exponential backoff
    if (retryCount < maxRetries && imageSrc !== fallbackSrc) {
      const delay = getRetryDelay(retryCount);
      logger.info(`🔄 Tentativa ${retryCount + 1}/${maxRetries} em ${delay}ms`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
      }, delay);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [imageSrc, fallbackSrc, retryCount, maxRetries, onError]);

  // Show loading state
  if (isLoading && !hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2 p-4">
          <Loader className="w-6 h-6 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  // Show error state (only if using fallback fails too)
  if (hasError && imageSrc === fallbackSrc) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <span className="text-sm text-destructive">Erro ao carregar imagem</span>
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
