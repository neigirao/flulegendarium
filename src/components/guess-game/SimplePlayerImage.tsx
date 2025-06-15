
import { useState, memo, useCallback, useMemo } from "react";
import { Player } from "@/types/guess-game";
import { MobileOptimizedImage } from "@/components/mobile/MobileOptimizedImage";

interface SimplePlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const SimplePlayerImage = memo(({ player, onImageLoaded }: SimplePlayerImageProps) => {
  const [imageError, setImageError] = useState<boolean>(false);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Imagem carregada com sucesso:', player.name);
    setImageError(false);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ Erro ao carregar imagem para:', player.name, 'URL:', player.image_url);
    setImageError(true);
  }, [player.name, player.image_url]);

  // Use optimized image source
  const imageSrc = useMemo(() => {
    if (imageError || !player.image_url) {
      return "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
    }
    return player.image_url;
  }, [imageError, player.image_url]);

  console.log('🖼️ Renderizando imagem para:', player.name, 'URL:', player.image_url);

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <MobileOptimizedImage
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
          <p className="break-all">URL: {player.image_url}</p>
        </div>
      )}
    </div>
  );
});

SimplePlayerImage.displayName = 'SimplePlayerImage';
