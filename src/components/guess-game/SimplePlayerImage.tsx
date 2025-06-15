
import { useState } from "react";
import { Player } from "@/types/guess-game";

interface SimplePlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const SimplePlayerImage = ({ player, onImageLoaded }: SimplePlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    console.log('✅ Imagem carregada com sucesso:', player.name);
    setIsLoading(false);
    setImageError(false);
    onImageLoaded?.();
  };

  const handleImageError = () => {
    console.error('❌ Erro ao carregar imagem para:', player.name, 'URL:', player.image_url);
    setImageError(true);
    setIsLoading(false);
  };

  const getImageSrc = () => {
    if (imageError || !player.image_url) {
      return "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
    }
    return player.image_url;
  };

  console.log('🖼️ Renderizando imagem para:', player.name, 'URL:', player.image_url);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[450px] rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flu-grena"></div>
            <p className="text-sm text-gray-600">Carregando imagem...</p>
          </div>
        </div>
      )}

      {/* Image container */}
      <div className="w-full h-full flex items-center justify-center p-2 md:p-3 lg:p-4">
        <img
          src={getImageSrc()}
          alt={`Imagem de ${player.name}`}
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: 'block' }}
        />
      </div>

      {/* Error state overlay */}
      {imageError && !isLoading && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
          Usando escudo padrão
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-1 rounded">
          {player.name} - {imageError ? 'ERRO' : 'OK'}
        </div>
      )}
    </div>
  );
};
