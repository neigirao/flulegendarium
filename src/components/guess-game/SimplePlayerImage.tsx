
import { useState, memo, useCallback, useMemo } from "react";
import { Player } from "@/types/guess-game";
import { MobileOptimizedImage } from "@/components/mobile/MobileOptimizedImage";
import { playerImagesFallbacks, defaultImage } from "@/utils/player-image/constants";

interface SimplePlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const SimplePlayerImage = memo(({ player, onImageLoaded }: SimplePlayerImageProps) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 2;

  const handleImageLoad = useCallback(() => {
    console.log('✅ Imagem carregada com sucesso:', player.name);
    setImageError(false);
    setRetryCount(0);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ Erro ao carregar imagem para:', player.name, 'URL:', player.image_url);
    
    if (retryCount < maxRetries) {
      // Try fallback image if available
      const fallback = playerImagesFallbacks[player.name];
      if (fallback && player.image_url !== fallback) {
        console.log('🔄 Tentando fallback para:', player.name);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    
    setImageError(true);
  }, [player.name, player.image_url, retryCount, maxRetries]);

  // Use optimized image source with fallback logic
  const imageSrc = useMemo(() => {
    if (imageError) {
      return defaultImage;
    }
    
    // Try fallback first if original failed
    if (retryCount > 0 && playerImagesFallbacks[player.name]) {
      return playerImagesFallbacks[player.name];
    }
    
    // Use original URL or default
    return player.image_url || defaultImage;
  }, [imageError, player.image_url, player.name, retryCount]);

  console.log('🖼️ Renderizando imagem para:', player.name, 'URL:', imageSrc, 'Retry:', retryCount);

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <MobileOptimizedImage
        key={`${player.id}-${retryCount}`} // Force re-render on retry
        src={imageSrc}
        alt={`Imagem de ${player.name}`}
        className="shadow-md hover:shadow-lg border-2 border-flu-verde"
        aspectRatio={4/5} // Standard player card aspect ratio
        priority={true} // High priority for game images
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* Error state overlay */}
      {imageError && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            Usando escudo padrão
          </div>
        </div>
      )}

      {/* Debug info em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs border">
          <p><strong>Debug:</strong> {player.name} - {imageError ? 'ERRO' : 'OK'}</p>
          <p>Tentativas: {retryCount}/{maxRetries}</p>
          <p className="break-all">URL: {imageSrc}</p>
        </div>
      )}
    </div>
  );
});

SimplePlayerImage.displayName = 'SimplePlayerImage';
