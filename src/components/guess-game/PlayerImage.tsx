import { useState, memo, useEffect } from "react";
import { defaultPlayerImage, playerImagesFallbacksMap } from "@/utils/playerImageUtils";
import { Loader } from "lucide-react";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
}

// Memoized component to prevent unnecessary re-renders
export const PlayerImage = memo(({ player, onImageFixed }: PlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Reset states and set image source when player changes
  useEffect(() => {
    if (player) {
      setImageError(false);
      setIsLoading(true);
      
      // Check if we have a fallback image for this player directly
      if (player.name && playerImagesFallbacksMap[player.name]) {
        setImageSrc(playerImagesFallbacksMap[player.name]);
      } else {
        // Otherwise use the provided image URL
        setImageSrc(player.image_url || defaultPlayerImage);
      }
    } else {
      setImageSrc(null);
    }
  }, [player?.id, player?.name]);

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'}`);
    
    if (!imageError) {
      setImageError(true);
      // Try to find fallback image if direct match failed
      if (player?.name) {
        // Try partial match in fallbacks
        for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
          if (player.name.includes(key) || key.includes(player.name)) {
            setImageSrc(url);
            setIsLoading(true);
            return;
          }
        }
      }
      
      // If no fallback found, use default and notify parent
      setImageSrc(defaultPlayerImage);
      onImageFixed();
    }
  };

  const handleImageLoaded = () => {
    setIsLoading(false);
  };

  // Early return for no image source
  if (!imageSrc) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-flu-verde flex items-center justify-center">
        <p className="text-gray-500">Imagem não disponível</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 text-flu-grena animate-spin" />
            <p className="text-sm text-gray-600 animate-pulse">Carregando imagem...</p>
          </div>
        </div>
      )}
      
      <div className="w-full h-full flex items-center justify-center p-2">
        <img
          src={imageSrc}
          alt={player?.name || "Jogador"}
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoaded}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
