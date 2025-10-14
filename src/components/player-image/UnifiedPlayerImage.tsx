import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { Player, DifficultyLevel } from '@/types/guess-game';
import { getReliableImageUrl } from '@/utils/player-image/imageUtils';
import { markImageAsLoaded } from '@/utils/player-image/cache';
import { cn } from '@/lib/utils';

interface UnifiedPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
  difficulty?: DifficultyLevel;
  priority?: boolean;
  className?: string;
  showDifficultyIndicator?: boolean;
}

const difficultyEffects = {
  muito_facil: {
    filter: "brightness(1) contrast(1) saturate(1)",
    borderColor: "border-green-400",
    glowColor: "shadow-green-400/20"
  },
  facil: {
    filter: "brightness(0.95) contrast(1.05) saturate(0.95)",
    borderColor: "border-blue-400", 
    glowColor: "shadow-blue-400/20"
  },
  medio: {
    filter: "brightness(0.9) contrast(1.1) saturate(0.9)",
    borderColor: "border-yellow-400",
    glowColor: "shadow-yellow-400/20"
  },
  dificil: {
    filter: "brightness(0.85) contrast(1.15) saturate(0.85)",
    borderColor: "border-orange-400",
    glowColor: "shadow-orange-400/20"
  },
  muito_dificil: {
    filter: "brightness(0.8) contrast(1.2) saturate(0.8)",
    borderColor: "border-red-400",
    glowColor: "shadow-red-400/20"
  }
};

export const UnifiedPlayerImage = memo(({
  player,
  onImageLoaded,
  difficulty,
  priority = false,
  className,
  showDifficultyIndicator = false
}: UnifiedPlayerImageProps) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const imageSrc = getReliableImageUrl(player);
  const effects = difficulty ? difficultyEffects[difficulty] : null;

  // Intersection Observer for lazy loading
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
      { rootMargin: '50px 0px', threshold: 0.01 }
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

  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
    markImageAsLoaded(player.id);
    onImageLoaded?.();
  }, [player.id, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error(`❌ Erro ao carregar imagem do jogador ${player.name} (${player.id}):`, imageSrc);
    setImageStatus('error');
    
    // Notificar sobre o erro para tracking
    console.warn(`🔍 Detalhes do erro:`, {
      playerId: player.id,
      playerName: player.name,
      imageUrl: player.image_url,
      resolvedUrl: imageSrc
    });
  }, [player.id, player.name, player.image_url, imageSrc]);

  return (
    <div className={cn("w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto", className)}>
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-muted/10",
        effects?.borderColor && `border-4 ${effects.borderColor}`,
        effects?.glowColor && `shadow-2xl ${effects.glowColor}`,
        difficulty && "p-1 rounded-3xl transition-all duration-500"
      )}>
        {/* Loading skeleton */}
        {imageStatus === 'loading' && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 animate-pulse rounded-lg">
            <div className="flex items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Image container */}
        <div 
          ref={imgRef}
          className={cn(
            "relative bg-background rounded-lg overflow-hidden",
            difficulty ? "w-80 h-80 md:w-96 md:h-96 rounded-2xl" : "aspect-[4/5] min-h-[300px]"
          )}
          style={effects ? { filter: effects.filter } : undefined}
        >
          {/* Image */}
          {(inView || priority) && (
            <img
              key={`${player.id}-${imageSrc}`}
              src={imageSrc}
              alt={`Foto de ${player.name}`}
              className={cn(
                "w-full h-full object-contain transition-all duration-500 border-2 border-primary shadow-md hover:shadow-lg",
                imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
              )}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                aspectRatio: difficulty ? '1' : '4/5',
                contentVisibility: priority ? 'visible' : 'auto'
              }}
            />
          )}

          {/* Error state */}
          {imageStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 text-muted-foreground p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">FLU</span>
              </div>
              <p className="text-sm text-center">Usando escudo do Fluminense</p>
            </div>
          )}
        </div>

        {/* Difficulty indicator */}
        {showDifficultyIndicator && difficulty && (
          <div className="absolute -top-2 -right-2 px-3 py-1 bg-background rounded-full shadow-lg border-2 border-border">
            <span className="text-sm font-bold text-foreground">
              {difficulty.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Adaptive text for difficulty mode */}
      {difficulty && (
        <div className="text-center mt-4">
          <p className="text-lg text-muted-foreground">
            Quem é este jogador?
          </p>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Dificuldade ajustada ao seu nível
          </p>
        </div>
      )}
    </div>
  );
});

UnifiedPlayerImage.displayName = 'UnifiedPlayerImage';