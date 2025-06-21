
import { memo, useCallback, useState, useEffect } from 'react';
import { Player } from '@/types/guess-game';
import { CriticalImage } from './CriticalImage';
import { playerImagesFallbacks, defaultImage } from '@/utils/player-image/constants';
import { cn } from '@/lib/utils';

interface LCPOptimizedPlayerImageProps {
  player: Player;
  priority?: boolean;
  onImageLoaded?: () => void;
  className?: string;
  isLCPCandidate?: boolean;
}

export const LCPOptimizedPlayerImage = memo(({
  player,
  priority = true,
  onImageLoaded,
  className = '',
  isLCPCandidate = false
}: LCPOptimizedPlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1;

  // Reset state when player changes
  useEffect(() => {
    setImageError(false);
    setRetryCount(0);
  }, [player.id]);

  const handleImageLoad = useCallback(() => {
    console.log(`🎯 ${isLCPCandidate ? 'LCP ' : ''}Optimized image loaded:`, player.name);
    setImageError(false);
    onImageLoaded?.();
    
    // Report LCP timing if this is a candidate
    if (isLCPCandidate) {
      const now = performance.now();
      console.log('📊 LCP: Player image loaded at', now, 'ms');
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lcp_player_image', {
          event_category: 'Performance', 
          event_label: player.name,
          value: Math.round(now)
        });
      }
    }
  }, [player.name, onImageLoaded, isLCPCandidate]);

  const handleImageError = useCallback(() => {
    console.warn(`⚠️ ${isLCPCandidate ? 'LCP ' : ''}Image error for:`, player.name);
    
    if (retryCount < maxRetries) {
      const fallback = playerImagesFallbacks[player.name];
      if (fallback && player.image_url !== fallback) {
        console.log(`🔄 Trying fallback for ${isLCPCandidate ? 'LCP ' : ''}image:`, player.name);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    
    setImageError(true);
  }, [player.name, player.image_url, retryCount, maxRetries, isLCPCandidate]);

  // Determine the best image source
  const getOptimizedImageSrc = () => {
    if (imageError) {
      return defaultImage;
    }
    
    if (retryCount > 0 && playerImagesFallbacks[player.name]) {
      return playerImagesFallbacks[player.name];
    }
    
    return player.image_url || defaultImage;
  };

  const imageSrc = getOptimizedImageSrc();

  console.log(`🖼️ ${isLCPCandidate ? 'LCP ' : ''}Image rendering:`, {
    player: player.name,
    src: imageSrc,
    priority,
    error: imageError,
    retries: retryCount,
    isLCP: isLCPCandidate
  });

  return (
    <div className={cn("w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto", className)}>
      <CriticalImage
        key={`${player.id}-${retryCount}`}
        src={imageSrc}
        alt={`Imagem de ${player.name}`}
        className="shadow-md hover:shadow-lg border-2 border-flu-verde rounded-lg"
        aspectRatio="4/5"
        priority={priority}
        isLCPCandidate={isLCPCandidate}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={400}
        height={500}
      />

      {/* Performance status indicator */}
      {priority && (
        <div className="mt-1 text-center">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs",
            isLCPCandidate ? "bg-green-100 text-green-700" : "bg-green-50 text-green-600"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isLCPCandidate ? "bg-green-500" : "bg-green-400"
            )}></span>
            {isLCPCandidate ? "LCP Crítico" : "Prioridade alta"}
          </span>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs border">
          <p><strong>{isLCPCandidate ? 'LCP ' : ''}Debug:</strong></p>
          <p>Player: {player.name}</p>
          <p>Priority: {priority ? 'HIGH' : 'LOW'}</p>
          <p>LCP Candidate: {isLCPCandidate ? 'YES' : 'NO'}</p>
          <p>Status: {imageError ? 'ERROR' : 'OK'}</p>
          <p>Retries: {retryCount}/{maxRetries}</p>
          <p className="break-all">URL: {imageSrc}</p>
        </div>
      )}
    </div>
  );
});

LCPOptimizedPlayerImage.displayName = 'LCPOptimizedPlayerImage';
