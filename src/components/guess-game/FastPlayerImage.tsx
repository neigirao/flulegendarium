
import { useState, useCallback } from "react";
import { Player } from "@/types/guess-game";

interface FastPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const FastPlayerImage = ({ player, onImageLoaded }: FastPlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const defaultImage = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
  
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
    onImageLoaded?.();
  }, [onImageLoaded]);

  const handleError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const imageSrc = imageError || !player.image_url ? defaultImage : player.image_url;

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/5', minHeight: '300px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={imageSrc}
          alt={`Foto de ${player.name}`}
          className="w-full h-full object-contain shadow-md border-2 border-flu-verde rounded-lg"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};
