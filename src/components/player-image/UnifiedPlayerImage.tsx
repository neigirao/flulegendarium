import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { Player, DifficultyLevel } from '@/types/guess-game';
import { getReliableImageUrl } from '@/utils/player-image/imageUtils';
import { markImageAsLoaded } from '@/utils/player-image/cache';
import { cn } from '@/lib/utils';
import { PlayerImageSkeleton } from '@/components/ui/shimmer-skeleton';

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
        {/* Loading skeleton with shimmer */}
        {imageStatus === 'loading' && (
          <div className="absolute inset-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer" />
            
            {/* Center placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="h-3 w-24 rounded bg-neutral-300 dark:bg-neutral-700" />
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