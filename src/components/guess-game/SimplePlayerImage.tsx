
import { useState, memo, useCallback, useMemo } from "react";
import { Player } from "@/types/guess-game";
import { defaultImage } from "@/utils/player-image/constants";

interface SimplePlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const SimplePlayerImage = memo(({ player, onImageLoaded }: SimplePlayerImageProps) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  console.log('🖼️ SimplePlayerImage render para:', player.name, 'URL:', player.image_url);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Imagem carregada com sucesso:', player.name);
    setImageError(false);
    setIsLoading(false);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ Erro ao carregar imagem para:', player.name);
    setImageError(true);
    setIsLoading(false);
  }, [player.name]);

  // Use fallback image if there's an error or no URL
  const imageSrc = useMemo(() => {
    if (imageError || !player.image_url) {
      return defaultImage;
    }
    return player.image_url;
  }, [imageError, player.image_url]);

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <div className="relative bg-white rounded-lg shadow-lg border-2 border-flu-verde overflow-hidden">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Carregando imagem...</span>
            </div>
          </div>
        )}

        <div className="aspect-[4/5] min-h-[300px] flex items-center justify-center p-4">
          <img
            key={`${player.id}-${imageSrc}`}
            src={imageSrc}
            alt={`Imagem de ${player.name}`}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="eager"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>

      {/* Status indicator */}
      {imageError && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Usando escudo do Fluminense
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs border">
          <p><strong>Debug SimplePlayerImage:</strong></p>
          <p>Player: {player.name} ({player.id})</p>
          <p>Status: {imageError ? 'ERRO - usando fallback' : isLoading ? 'CARREGANDO' : 'CARREGADA'}</p>
          <p className="break-all">URL: {imageSrc}</p>
        </div>
      )}
    </div>
  );
});

SimplePlayerImage.displayName = 'SimplePlayerImage';
