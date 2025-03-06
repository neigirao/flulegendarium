
import { useState, memo, useEffect } from "react";
import { defaultPlayerImage } from "@/utils/playerImageUtils";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
}

// Componente memoizado para evitar re-renderizações desnecessárias
export const PlayerImage = memo(({ player, onImageFixed }: PlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset states when player changes
  useEffect(() => {
    if (player) {
      setImageError(false);
      setIsLoading(true);
    }
  }, [player?.id]);

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'}`);
    if (!imageError) {
      setImageError(true);
      // Automatically trigger the image fixed function if there's an error
      onImageFixed();
    }
  };

  const handleImageLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {imageError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">Carregando imagem alternativa...</p>
          </div>
        </div>
      ) : (
        <img
          src={player?.image_url || defaultPlayerImage}
          alt="Jogador"
          className={`w-full h-full object-cover transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoaded}
          loading="eager"
          decoding="async"
        />
      )}
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
