import { useState, useCallback, memo } from 'react';
import { useLayoutShiftPrevention } from '@/hooks/performance';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';
import { playerSilhouetteSvg, fluminenseJerseySvg } from '@/utils/fallback-images/fluminenseSvg';

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  /** Tipo de imagem para fallback apropriado */
  imageType?: 'player' | 'jersey';
}

/**
 * Componente de imagem otimizado para mobile
 * GARANTE que sempre mostra uma imagem - nunca mostra erro
 * 
 * Hierarquia de fallback:
 * 1. Imagem original
 * 2. fallbackSrc configurado
 * 3. SVG inline (NUNCA falha)
 */
export const MobileOptimizedImage = memo(({
  src,
  alt,
  className,
  aspectRatio = 1,
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
  imageType = 'player'
}: MobileOptimizedImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackLevel, setFallbackLevel] = useState(0);
  
  // SVG garantido que NUNCA falha
  const guaranteedSvg = imageType === 'jersey' ? fluminenseJerseySvg : playerSilhouetteSvg;
  
  const { containerRef } = useLayoutShiftPrevention({
    reserveSpace: true,
    aspectRatio,
    minHeight: 200
  });

  const handleImageLoad = useCallback(() => {
    logger.debug(`MobileOptimizedImage loaded: ${currentSrc.substring(0, 50)}`, 'MOBILE_IMAGE');
    setImageLoaded(true);
    onLoad?.();
  }, [currentSrc, onLoad]);

  const handleImageError = useCallback(() => {
    logger.error(`MobileOptimizedImage error level ${fallbackLevel}: ${currentSrc.substring(0, 50)}`, 'MOBILE_IMAGE');
    
    // Subir para próximo nível de fallback
    if (fallbackLevel === 0 && currentSrc !== fallbackSrc) {
      // Nível 0 -> 1: Tentar fallbackSrc
      logger.debug(`Trying fallback level 1: ${fallbackSrc}`, 'MOBILE_IMAGE');
      setCurrentSrc(fallbackSrc);
      setFallbackLevel(1);
    } else if (fallbackLevel <= 1 && currentSrc !== guaranteedSvg) {
      // Nível 1 -> 2: Usar SVG garantido
      logger.debug('Using guaranteed SVG fallback', 'MOBILE_IMAGE');
      setCurrentSrc(guaranteedSvg);
      setFallbackLevel(2);
      // SVG inline não precisa carregar, marca como loaded
      setImageLoaded(true);
    }
    
    onError?.();
  }, [currentSrc, fallbackSrc, fallbackLevel, guaranteedSvg, onError]);

  // Generate srcset for different screen densities
  const generateSrcSet = useCallback((baseSrc: string) => {
    // Não gerar srcset para data URLs (SVG inline)
    if (baseSrc.startsWith('data:')) {
      return undefined;
    }
    if (baseSrc.includes('lovable-uploads')) {
      return `${baseSrc} 1x, ${baseSrc} 2x`;
    }
    return baseSrc;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted rounded-lg',
        'transition-all duration-300',
        className
      )}
      style={{ aspectRatio: aspectRatio.toString() }}
    >
      {/* Loading skeleton - só mostra enquanto não carregou */}
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted">
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 bg-muted-foreground/20 rounded-full animate-spin border-2 border-t-primary"></div>
          </div>
        </div>
      )}

      {/* Imagem - SEMPRE renderiza, nunca mostra estado de erro */}
      <img
        key={currentSrc}
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

      {/* Loading indicator para conexões lentas - só se ainda não carregou */}
      {!imageLoaded && (
        <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
          Carregando...
        </div>
      )}
    </div>
  );
});

MobileOptimizedImage.displayName = 'MobileOptimizedImage';
