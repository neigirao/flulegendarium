import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Jersey } from "@/types/jersey-game";
import type { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";
import { UnifiedSkeleton } from "@/components/skeletons/UnifiedSkeleton";
import { getTransformedImageUrl, isSupabaseStorageUrl, getResponsiveSrcSet } from '@/utils/image/supabaseTransforms';
import { getReliableJerseyImageUrl, jerseyDefaultImage } from '@/utils/jersey-image/imageUtils';
import { reportJerseyImageProblem } from '@/utils/jersey-image/problemTracking';
import { logger } from '@/utils/logger';

interface JerseyImageProps {
  jersey: Jersey;
  onImageLoaded: () => void;
  difficulty: DifficultyLevel;
  priority?: boolean;
}

const difficultyEffects = {
  muito_facil: {
    filter: "brightness(1) contrast(1) saturate(1)",
    borderColor: "border-difficulty-very-easy",
    glowColor: "shadow-difficulty-very-easy/20"
  },
  facil: {
    filter: "brightness(0.95) contrast(1.05) saturate(0.95)",
    borderColor: "border-difficulty-easy",
    glowColor: "shadow-difficulty-easy/20"
  },
  medio: {
    filter: "brightness(0.9) contrast(1.1) saturate(0.9)",
    borderColor: "border-difficulty-medium",
    glowColor: "shadow-difficulty-medium/20"
  },
  dificil: {
    filter: "brightness(0.85) contrast(1.15) saturate(0.85)",
    borderColor: "border-difficulty-hard",
    glowColor: "shadow-difficulty-hard/20"
  },
  muito_dificil: {
    filter: "brightness(0.8) contrast(1.2) saturate(0.8)",
    borderColor: "border-difficulty-very-hard",
    glowColor: "shadow-difficulty-very-hard/20"
  }
};

const jerseyTypeLabels: Record<string, string> = {
  home: 'Titular',
  away: 'Reserva',
  third: 'Terceiro',
  special: 'Especial'
};

export const JerseyImage = ({
  jersey,
  onImageLoaded,
  difficulty,
  priority = true
}: JerseyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(priority);
  const [triedFallback, setTriedFallback] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const effects = difficultyEffects[difficulty] || difficultyEffects.medio;

  // Get reliable image URL with fallback system
  const reliableUrl = getReliableJerseyImageUrl(jersey);
  
  // Optimized image URL with Supabase transforms
  const optimizedSrc = isSupabaseStorageUrl(reliableUrl)
    ? getTransformedImageUrl(reliableUrl, { width: 384, height: 384, quality: 85 })
    : reliableUrl;

  const srcSet = isSupabaseStorageUrl(reliableUrl)
    ? getResponsiveSrcSet(reliableUrl)
    : undefined;

  // Initialize currentSrc when optimizedSrc changes
  useEffect(() => {
    setCurrentSrc(optimizedSrc);
    setTriedFallback(false);
    setHasError(false);
    setIsLoading(true);
  }, [optimizedSrc]);

  // Intersection Observer for lazy loading (when not priority)
  useEffect(() => {
    if (priority || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px 0px', threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, inView]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onImageLoaded();
  }, [onImageLoaded]);

  const handleError = useCallback(() => {
    logger.error(`❌ Erro ao carregar imagem da camisa ${jersey.years.join('/')}`, 'JERSEY_IMAGE', {
      jerseyId: jersey.id,
      originalUrl: jersey.image_url,
      optimizedUrl: currentSrc,
      triedFallback
    });
    
    // Se ainda não tentou fallback, tentar imagem padrão
    if (!triedFallback) {
      logger.info(`🔄 Tentando fallback para camisa ${jersey.years.join('/')}`, 'JERSEY_IMAGE');
      setTriedFallback(true);
      setCurrentSrc(jerseyDefaultImage);
      return;
    }
    
    // Reportar problema para tracking
    reportJerseyImageProblem(
      jersey.id,
      jersey.years,
      jersey.image_url,
      currentSrc,
      'Failed to load even after fallback'
    );
    
    setIsLoading(false);
    setHasError(true);
    // Still call onImageLoaded to prevent game from stalling
    onImageLoaded();
  }, [jersey, currentSrc, triedFallback, onImageLoaded]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div 
        ref={containerRef}
        className={cn(
          "relative p-1 rounded-3xl border-4 transition-all duration-500 shadow-2xl",
          effects.borderColor,
          effects.glowColor
        )}
      >
        <div 
          className="relative rounded-2xl overflow-hidden bg-card w-80 h-80 md:w-96 md:h-96"
          style={{ filter: effects.filter }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <UnifiedSkeleton variant="player-image" />
            </div>
          )}
          
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center text-muted-foreground">
                <img 
                  src={jerseyDefaultImage} 
                  alt="Camisa não disponível"
                  className="w-24 h-24 mx-auto mb-2 opacity-50"
                />
                <p className="text-sm">Imagem não disponível</p>
              </div>
            </div>
          ) : (inView || priority) && currentSrc && (
            <img
              src={currentSrc}
              srcSet={!triedFallback ? srcSet : undefined}
              sizes="(max-width: 640px) 320px, 384px"
              alt="Camisa histórica do Fluminense"
              className={cn(
                "w-full h-full object-contain transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? "eager" : "lazy"}
              decoding={priority ? "sync" : "async"}
              fetchPriority={priority ? "high" : "auto"}
              data-testid="jersey-image"
              data-lcp-critical={priority ? "true" : undefined}
              style={{
                containIntrinsicSize: '384px 384px',
                contentVisibility: priority ? 'visible' : 'auto'
              }}
            />
          )}
        </div>
        
        {/* Jersey type indicator overlay */}
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-card rounded-full shadow-lg border-2 border-border">
          <span className="text-sm font-bold text-foreground">
            {jerseyTypeLabels[jersey.type] || jersey.type.toUpperCase()}
          </span>
        </div>
        
        {/* Manufacturer badge if available */}
        {jersey.manufacturer && (
          <div className="absolute -bottom-2 -left-2 px-3 py-1 bg-card rounded-full shadow-lg border-2 border-border">
            <span className="text-xs text-muted-foreground">
              {jersey.manufacturer}
            </span>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          De que ano é essa camisa?
        </p>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Digite o ano exato para mais pontos!
        </p>
      </div>
    </div>
  );
};