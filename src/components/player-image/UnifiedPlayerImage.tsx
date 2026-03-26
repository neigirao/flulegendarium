import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { Player, DifficultyLevel } from '@/types/guess-game';
import { getReliableImageUrl } from '@/utils/player-image/imageUtils';
import { markImageAsLoaded } from '@/utils/player-image/cache';
import { cn } from '@/lib/utils';
import { defaultImage, MAX_IMAGE_RETRIES, SUPABASE_STORAGE_URL } from '@/utils/player-image/constants';
import { reportImageError } from '@/services/imageReportService';
import { logger } from '@/utils/logger';

import { 
  getTransformedImageUrl, 
  isSupabaseStorageUrl, 
  getResponsiveSrcSet 
} from '@/utils/image/supabaseTransforms';

interface UnifiedPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
  difficulty?: DifficultyLevel;
  priority?: boolean;
  className?: string;
  showDifficultyIndicator?: boolean;
}

interface SmartFramingResult {
  position: string;
  zoom: number;
}

const MAX_FRAMING_CACHE_ITEMS = 120;

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

/**
 * Gera URL alternativa para retry baseada no nome do jogador
 */
const getAlternativeUrl = (player: Player, retryCount: number): string => {
  // Primeira tentativa: Supabase Storage com nome normalizado
  if (retryCount === 1) {
    const normalizedName = player.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return `${SUPABASE_STORAGE_URL}/${normalizedName}.png`;
  }
  
  // Segunda tentativa: imagem padrão
  return defaultImage;
};

const analyzeImageFraming = (img: HTMLImageElement): SmartFramingResult => {
  const fallback = { position: '50% 50%', zoom: 1 };

  if (typeof document === 'undefined') return fallback;
  if (!img.naturalWidth || !img.naturalHeight) return fallback;

  const targetMaxDimension = 128;
  const scale = Math.min(1, targetMaxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const sampleWidth = Math.max(8, Math.round(img.naturalWidth * scale));
  const sampleHeight = Math.max(8, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return fallback;

  try {
    context.drawImage(img, 0, 0, sampleWidth, sampleHeight);
    const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight).data;

    let minX = sampleWidth;
    let minY = sampleHeight;
    let maxX = -1;
    let maxY = -1;
    let visiblePixels = 0;

    for (let y = 0; y < sampleHeight; y++) {
      for (let x = 0; x < sampleWidth; x++) {
        const alpha = imageData[(y * sampleWidth + x) * 4 + 3];
        if (alpha > 24) {
          visiblePixels++;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (visiblePixels === 0) return fallback;

    const visibleRatio = visiblePixels / (sampleWidth * sampleHeight);
    if (visibleRatio > 0.96) return fallback;

    const contentWidth = Math.max(1, maxX - minX + 1);
    const contentHeight = Math.max(1, maxY - minY + 1);
    const centerX = ((minX + maxX) / 2 / sampleWidth) * 100;
    const centerY = ((minY + maxY) / 2 / sampleHeight) * 100;

    const widthFillRatio = contentWidth / sampleWidth;
    const heightFillRatio = contentHeight / sampleHeight;
    const zoomFactor = Math.min(
      1.18,
      Math.max(1, Math.min(1 / widthFillRatio, 1 / heightFillRatio) * 0.92)
    );

    return {
      position: `${centerX.toFixed(2)}% ${centerY.toFixed(2)}%`,
      zoom: Number(zoomFactor.toFixed(3))
    };
  } catch {
    return fallback;
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
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [inView, setInView] = useState(priority);
  const [imageFraming, setImageFraming] = useState<SmartFramingResult>({ position: '50% 50%', zoom: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const originalSrcRef = useRef<string>('');
  const framingCacheRef = useRef<Map<string, SmartFramingResult>>(new Map());
  const isMountedRef = useRef(true);
  const idleTaskIdRef = useRef<number | null>(null);
  const timeoutTaskIdRef = useRef<number | null>(null);

  // Obter URL inicial
  useEffect(() => {
    const initialSrc = getReliableImageUrl(player);
    originalSrcRef.current = initialSrc;
    setCurrentSrc(initialSrc);
    setRetryCount(0);
    setImageStatus('loading');
    setImageFraming({ position: '50% 50%', zoom: 1 });
  }, [player]);

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

    const currentRef = containerRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [priority, inView]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      if (typeof window !== 'undefined' && idleTaskIdRef.current !== null && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(idleTaskIdRef.current);
      }

      if (timeoutTaskIdRef.current !== null) {
        clearTimeout(timeoutTaskIdRef.current);
      }
    };
  }, []);

  const optimizeImageFraming = useCallback((imgElement: HTMLImageElement) => {
    const cacheKey = `${player.id}:${currentSrc}`;
    const cachedFraming = framingCacheRef.current.get(cacheKey);

    if (cachedFraming) {
      setImageFraming(cachedFraming);
      return;
    }

    const runAnalysis = () => {
      const analyzedFraming = analyzeImageFraming(imgElement);

      if (!isMountedRef.current) return;

      if (framingCacheRef.current.size >= MAX_FRAMING_CACHE_ITEMS) {
        const oldestKey = framingCacheRef.current.keys().next().value;
        if (oldestKey) {
          framingCacheRef.current.delete(oldestKey);
        }
      }

      framingCacheRef.current.set(cacheKey, analyzedFraming);
      setImageFraming(analyzedFraming);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleTaskIdRef.current = (window as Window & { requestIdleCallback: (callback: IdleRequestCallback) => number })
        .requestIdleCallback(() => runAnalysis());
      return;
    }

    timeoutTaskIdRef.current = globalThis.setTimeout(runAnalysis, 0);
  }, [player.id, currentSrc]);

  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
    markImageAsLoaded(player.id);

    if (imgElementRef.current) {
      optimizeImageFraming(imgElementRef.current);
    }
    
    if (retryCount > 0) {
      logger.info(`Imagem carregada após ${retryCount} retry(s)`, 'IMAGE_RETRY', {
        playerId: player.id,
        playerName: player.name,
        finalUrl: currentSrc
      });
    }
    
    onImageLoaded?.();
  }, [player.id, player.name, currentSrc, retryCount, onImageLoaded, optimizeImageFraming]);

  const handleImageError = useCallback(() => {
    logger.warn(`Erro ao carregar imagem (tentativa ${retryCount + 1})`, 'IMAGE_ERROR', {
      playerId: player.id,
      playerName: player.name,
      attemptedUrl: currentSrc
    });

    // Tentar URL alternativa se ainda houver retries disponíveis
    if (retryCount < MAX_IMAGE_RETRIES) {
      const nextRetry = retryCount + 1;
      const alternativeUrl = getAlternativeUrl(player, nextRetry);
      
      logger.info(`Tentando URL alternativa (retry ${nextRetry})`, 'IMAGE_RETRY', {
        playerId: player.id,
        newUrl: alternativeUrl
      });
      
      setRetryCount(nextRetry);
      setCurrentSrc(alternativeUrl);
      return;
    }

    // Todas as tentativas falharam - reportar erro
    setImageStatus('error');
    
    // Reportar erro para o backend (async, não bloqueia)
    reportImageError({
      player_id: player.id,
      player_name: player.name,
      original_url: originalSrcRef.current,
      resolved_url: currentSrc,
      error_type: 'load_error',
      retry_count: retryCount
    });

    logger.error(`Todas as tentativas falharam para ${player.name}`, 'IMAGE_ERROR', {
      playerId: player.id,
      originalUrl: originalSrcRef.current,
      lastAttemptedUrl: currentSrc
    });
  }, [player, currentSrc, retryCount]);

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
          ref={containerRef}
          className={cn(
            "relative bg-background rounded-lg overflow-hidden",
            difficulty ? "w-full h-full rounded-2xl" : "aspect-[4/5] min-h-[300px]"
          )}
        >
          {/* Image with srcset for responsive loading */}
          {(inView || priority) && currentSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted/20 to-background/20">
              <img
                ref={imgElementRef}
                key={`${player.id}-${currentSrc}-${retryCount}`}
                src={isSupabaseStorageUrl(currentSrc) 
                  ? getTransformedImageUrl(currentSrc, { width: 400, quality: 80, format: 'webp' }) 
                  : currentSrc}
                srcSet={isSupabaseStorageUrl(currentSrc) 
                  ? getResponsiveSrcSet(currentSrc, [320, 480, 640, 800]) 
                  : undefined}
                sizes={difficulty 
                  ? "(max-width: 768px) 320px, 384px" 
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 400px, 500px"}
                alt={`Foto de ${player.name}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                )}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
                onLoad={handleImageLoad}
                onError={handleImageError}
                data-testid="player-image"
                data-lcp-critical={priority ? 'true' : undefined}
                style={{
                  objectPosition: imageFraming.position,
                  transform: `scale(${imageFraming.zoom})`,
                  transformOrigin: 'center center',
                  contentVisibility: priority ? 'visible' : 'auto',
                  containIntrinsicSize: difficulty ? '384px 384px' : '400px 500px'
                }}
              />
            </div>
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
