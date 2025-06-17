
import { memo, useCallback, useState, useEffect } from 'react';
import { Player } from '@/types/guess-game';
import { CriticalImage } from './CriticalImage';
import { playerImagesFallbacks, defaultImage } from '@/utils/player-image/constants';

interface LCPOptimizedPlayerImageProps {
  player: Player;
  priority?: boolean;
  onImageLoaded?: () => void;
  className?: string;
}

export const LCPOptimizedPlayerImage = memo(({
  player,
  priority = true,
  onImageLoaded,
  className = ''
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
    console.log('🎯 LCP optimized image loaded:', player.name);
    setImageError(false);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.warn('⚠️ LCP image error for:', player.name);
    
    if (retryCount < maxRetries) {
      const fallback = playerImagesFallbacks[player.name];
      if (fallback && player.image_url !== fallback) {
        console.log('🔄 Trying fallback for LCP image:', player.name);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    
    setImageError(true);
  }, [player.name, player.image_url, retryCount, maxRetries]);

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

  console.log('🖼️ LCP Image rendering:', {
    player: player.name,
    src: imageSrc,
    priority,
    error: imageError,
    retries: retryCount
  });

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto ${className}`}>
      <CriticalImage
        key={`${player.id}-${retryCount}`}
        src={imageSrc}
        alt={`Imagem de ${player.name}`}
        className="shadow-md hover:shadow-lg border-2 border-flu-verde rounded-lg"
        aspectRatio="4/5"
        priority={priority}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={400}
        height={500}
      />

      {/* Performance status indicator */}
      {priority && (
        <div className="mt-1 text-center">
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded text-xs">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            Prioridade alta
          </span>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs border">
          <p><strong>LCP Debug:</strong></p>
          <p>Player: {player.name}</p>
          <p>Priority: {priority ? 'HIGH' : 'LOW'}</p>
          <p>Status: {imageError ? 'ERROR' : 'OK'}</p>
          <p>Retries: {retryCount}/{maxRetries}</p>
          <p className="break-all">URL: {imageSrc}</p>
        </div>
      )}
    </div>
  );
});

LCPOptimizedPlayerImage.displayName = 'LCPOptimizedPlayerImage';
