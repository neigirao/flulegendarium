import { useState, useCallback, memo } from 'react';
import { validateImageUrl } from '@/utils/validation/dataValidators';
import { Loader } from 'lucide-react';
import { 
  isProblematicDomain, 
  isUrlProblematic, 
  markUrlAsProblematic,
  getRetryDelay 
} from '@/utils/player-image/problematicUrls';
import { logger } from '@/utils/logger';
import { playerSilhouetteSvg, fluminenseJerseySvg } from '@/utils/fallback-images/fluminenseSvg';


interface ImageGuardProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
  /** Tipo de imagem para fallback apropriado */
  imageType?: 'player' | 'jersey';
  /** Nome do item para feedback */
  itemName?: string;
  /** ID do item para feedback */
  itemId?: string;
}

/**
 * Componente que GARANTE exibição de imagem
 * NUNCA mostra ícone de erro - sempre mostra uma imagem
 * 
 * Hierarquia de fallback:
 * 1. Imagem original
 * 2. fallbackSrc configurado
 * 3. SVG inline (NUNCA falha - embutido no código)
 */
export const ImageGuard = memo(({
  src,
  alt,
  className = '',
  fallbackSrc = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
  onError,
  onLoad,
  priority = false,
  imageType = 'player',
  itemName,
  itemId
}: ImageGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentFallbackLevel, setCurrentFallbackLevel] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // SVG garantido que NUNCA falha (embutido no código)
  const guaranteedSvg = imageType === 'jersey' ? fluminenseJerseySvg : playerSilhouetteSvg;

  // Determina qual imagem usar baseado no nível de fallback
  const getImageSrc = useCallback((): string => {
    // Validate and sanitize original URL
    const validation = validateImageUrl(src);
    const validatedSrc = validation.isValid ? validation.sanitizedData : null;

    switch (currentFallbackLevel) {
      case 0: {
        // Nível 0: Tentar imagem original
        if (!validatedSrc) {
          return fallbackSrc; // Se inválida, pular para fallback
        }
        
        // Verificar se é problemática
        const isExternal = validatedSrc.startsWith('http://') || validatedSrc.startsWith('https://');
        if (isExternal && (isProblematicDomain(validatedSrc) || isUrlProblematic(validatedSrc))) {
          logger.warn(`⚠️ URL problemática detectada, usando fallback: ${validatedSrc}`);
          return fallbackSrc;
        }
        
        return validatedSrc;
      }
      case 1:
        // Nível 1: Fallback configurado
        return fallbackSrc;
      case 2:
      default:
        // Nível 2: SVG garantido (NUNCA falha)
        return guaranteedSvg;
    }
  }, [src, fallbackSrc, currentFallbackLevel, guaranteedSvg]);

  const imageSrc = getImageSrc();

  const handleLoad = useCallback(() => {
    logger.info('✅ Imagem carregada com sucesso:', imageSrc.substring(0, 50));
    setIsLoading(false);
    setRetryCount(0);
    onLoad?.();
  }, [imageSrc, onLoad]);

  const handleError = useCallback(() => {
    logger.error('❌ Erro ao carregar imagem:', imageSrc.substring(0, 50));
    
    // Se é URL externa, marcar como problemática
    const isExternal = imageSrc.startsWith('http://') || imageSrc.startsWith('https://');
    if (isExternal) {
      markUrlAsProblematic(imageSrc);
    }

    // Tentar retry com backoff exponencial antes de subir nível
    if (retryCount < maxRetries && currentFallbackLevel < 2) {
      const delay = getRetryDelay(retryCount);
      logger.info(`🔄 Retry ${retryCount + 1}/${maxRetries} em ${delay}ms`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, delay);
      return;
    }

    // Subir para próximo nível de fallback
    if (currentFallbackLevel < 2) {
      logger.warn(`⬆️ Subindo para fallback nível ${currentFallbackLevel + 1}`);
      setCurrentFallbackLevel(prev => prev + 1);
      setRetryCount(0);
      setIsLoading(true);
    } else {
      // Nível 2 (SVG) NUNCA deve falhar, mas por segurança
      logger.error('🚨 Fallback SVG falhou (impossível). Mantendo SVG.');
      setIsLoading(false);
    }
    
    onError?.();
  }, [imageSrc, retryCount, maxRetries, currentFallbackLevel, onError]);

  // Loading state com skeleton
  if (isLoading) {
    return (
      <div className={`relative ${className}`} data-testid="image-guard-container">
        {/* Skeleton loader */}
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" data-testid="image-skeleton" />
        
        {/* Imagem carregando por baixo */}
        <img
          key={`${imageSrc}-${retryCount}-${currentFallbackLevel}`}
          src={imageSrc}
          alt={alt}
          className={`${className} opacity-0`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => {
            setIsLoading(false);
            handleLoad();
          }}
          onError={handleError}
        />
        
        {/* Indicador de loading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  // Imagem carregada - SEMPRE mostra imagem, NUNCA erro
  return (
    <div className={`relative ${className}`}>
      <img
        key={`${imageSrc}-loaded`}
        src={imageSrc}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={handleError}
        data-testid="image-guard"
      />
      {currentFallbackLevel >= 1 && itemName && (
        <ImageFeedbackButton
          itemName={itemName}
          itemType={imageType}
          imageUrl={typeof src === 'string' ? src : null}
          itemId={itemId}
        />
      )}
    </div>
  );
});

ImageGuard.displayName = 'ImageGuard';
