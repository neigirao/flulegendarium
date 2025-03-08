
import { useState, memo, useEffect } from "react";
import { defaultPlayerImage } from "@/utils/playerImageUtils";
import { Loader } from "lucide-react";

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
    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-md transition-all duration-300 hover:shadow-lg">
      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 text-flu-grena animate-spin" />
            <p className="text-sm text-gray-600 animate-pulse">Carregando imagem...</p>
          </div>
        </div>
      )}
      
      {imageError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">Carregando imagem alternativa...</p>
            <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          <img
            src={player?.image_url || defaultPlayerImage}
            alt="Jogador"
            className={`max-w-full max-h-full object-contain transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}
            onError={handleImageError}
            onLoad={handleImageLoaded}
            loading="eager"
            decoding="async"
          />
        </div>
      )}
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
