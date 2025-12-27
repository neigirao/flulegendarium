import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Jersey } from "@/types/jersey-game";
import type { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";
import { UnifiedSkeleton } from "@/components/skeletons/UnifiedSkeleton";
import { getTransformedImageUrl, isSupabaseStorageUrl, getResponsiveSrcSet } from '@/utils/image/supabaseTransforms';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const effects = difficultyEffects[difficulty] || difficultyEffects.medio;

  // Optimized image URL with Supabase transforms
  const optimizedSrc = isSupabaseStorageUrl(jersey.image_url)
    ? getTransformedImageUrl(jersey.image_url, { width: 384, height: 384, quality: 85 })
    : jersey.image_url;

  const srcSet = isSupabaseStorageUrl(jersey.image_url)
    ? getResponsiveSrcSet(jersey.image_url)
    : undefined;

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
    setIsLoading(false);
    setHasError(true);
    // Still call onImageLoaded to prevent game from stalling
    onImageLoaded();
  }, [onImageLoaded]);

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
                <span className="text-4xl mb-2">👕</span>
                <p className="text-sm">Imagem não disponível</p>
              </div>
            </div>
          ) : (inView || priority) && (
            <img
              src={optimizedSrc}
              srcSet={srcSet}
              sizes="(max-width: 640px) 320px, 384px"
              alt="Camisa histórica do Fluminense"
              className={cn(
                "w-full h-full object-contain transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
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