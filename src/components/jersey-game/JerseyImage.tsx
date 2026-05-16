import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Jersey } from "@/types/jersey-game";
import type { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";
import { UnifiedSkeleton } from "@/components/skeletons/UnifiedSkeleton";
import { getTransformedImageUrl, isSupabaseStorageUrl, getResponsiveSrcSet } from '@/utils/image/supabaseTransforms';
import { getReliableJerseyImageUrl, jerseyDefaultImage } from '@/utils/jersey-image/imageUtils';
import { reportJerseyImageProblem } from '@/utils/jersey-image/problemTracking';
import { logger } from '@/utils/logger';

export type JerseyFeedbackState = 'idle' | 'correct' | 'wrong';

interface JerseyImageProps {
  jersey: Jersey;
  onImageLoaded: () => void;
  difficulty: DifficultyLevel;
  priority?: boolean;
  feedbackState?: JerseyFeedbackState;
}

const difficultyEffects: Record<DifficultyLevel, string> = {
  muito_facil: "brightness(1) contrast(1) saturate(1)",
  facil: "brightness(0.95) contrast(1.05) saturate(0.95)",
  medio: "brightness(0.9) contrast(1.1) saturate(0.9)",
  dificil: "brightness(0.85) contrast(1.15) saturate(0.85)",
  muito_dificil: "brightness(0.8) contrast(1.2) saturate(0.8)",
};

const jerseyTypeLabels: Record<string, string> = {
  home: 'Titular',
  away: 'Reserva',
  third: 'Terceiro',
  special: 'Especial',
};

export const JerseyImage = ({
  jersey,
  onImageLoaded,
  difficulty,
  priority = true,
  feedbackState = 'idle',
}: JerseyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(priority);
  const [triedFallback, setTriedFallback] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filter = difficultyEffects[difficulty] ?? difficultyEffects.medio;
  const reliableUrl = getReliableJerseyImageUrl(jersey);
  const optimizedSrc = isSupabaseStorageUrl(reliableUrl)
    ? getTransformedImageUrl(reliableUrl, { width: 384, height: 480, quality: 85 })
    : reliableUrl;
  const srcSet = isSupabaseStorageUrl(reliableUrl) ? getResponsiveSrcSet(reliableUrl) : undefined;

  useEffect(() => {
    setCurrentSrc(optimizedSrc);
    setTriedFallback(false);
    setHasError(false);
    setIsLoading(true);
  }, [optimizedSrc]);

  useEffect(() => {
    if (priority || inView) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) { setInView(true); observer.disconnect(); } }); },
      { rootMargin: '100px 0px', threshold: 0.01 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority, inView]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onImageLoaded();
  }, [onImageLoaded]);

  const handleError = useCallback(() => {
    logger.error(`❌ Erro ao carregar imagem da camisa ${jersey.years.join('/')}`, 'JERSEY_IMAGE', {
      jerseyId: jersey.id, originalUrl: jersey.image_url, optimizedUrl: currentSrc, triedFallback
    });
    if (!triedFallback) {
      setTriedFallback(true);
      setCurrentSrc(jerseyDefaultImage);
      return;
    }
    reportJerseyImageProblem(jersey.id, jersey.years, jersey.image_url, currentSrc, 'Failed to load even after fallback');
    setIsLoading(false);
    setHasError(true);
    onImageLoaded();
  }, [jersey, currentSrc, triedFallback, onImageLoaded]);

  const frameClass = cn(
    "relative rounded-[18px] border-[3px] p-6 flex flex-col transition-all duration-300 w-full",
    feedbackState === 'correct'
      ? "border-[#22C55E] shadow-[0_8px_32px_rgba(34,197,94,0.2)]"
      : feedbackState === 'wrong'
      ? "border-destructive shadow-[0_8px_32px_rgba(239,68,68,0.15)]"
      : "border-accent shadow-[0_8px_32px_rgba(196,148,74,0.15)]",
    "bg-card"
  );

  return (
    <div ref={containerRef} className={frameClass} style={{ aspectRatio: '1/1.15' }}>
      {/* Badges row */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.06em] px-2.5 py-1.5 rounded-lg bg-secondary/90 text-white backdrop-blur-sm">
          👕 {jerseyTypeLabels[jersey.type] ?? jersey.type}
        </div>
        {jersey.manufacturer && (
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] px-2.5 py-1.5 rounded-lg bg-white/90 text-foreground border border-border backdrop-blur-sm">
            {jersey.manufacturer}
          </div>
        )}
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center mt-6 overflow-hidden rounded-xl" style={{ filter }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <UnifiedSkeleton variant="player-image" />
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <img src={jerseyDefaultImage} alt="Camisa não disponível" className="w-24 h-24 opacity-50 mb-2" />
            <p className="text-sm">Imagem não disponível</p>
          </div>
        ) : (inView || priority) && currentSrc ? (
          <img
            src={currentSrc}
            srcSet={!triedFallback ? srcSet : undefined}
            sizes="(max-width: 640px) 320px, 384px"
            alt="Camisa histórica do Fluminense"
            className={cn("w-full h-full object-contain transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            data-testid="jersey-image"
            data-lcp-critical={priority ? "true" : undefined}
            style={{ containIntrinsicSize: '384px 480px', contentVisibility: priority ? 'visible' : 'auto' }}
          />
        ) : null}
      </div>
    </div>
  );
};
