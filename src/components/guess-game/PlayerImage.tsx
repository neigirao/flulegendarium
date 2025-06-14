
import { memo, useRef, useEffect } from "react";
import { usePlayerImage } from "@/hooks/use-player-image";
import { ImageLoader } from "./ImageLoader";
import { ImageErrorDisplay } from "./ImageErrorDisplay";
import { OptimizedImage } from "@/components/performance/OptimizedImage";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
  onImageLoaded?: () => void;
}

export const PlayerImage = memo(({ player, onImageFixed, onImageLoaded }: PlayerImageProps) => {
  const { imageError, isLoading, imageSrc, handleImageError, handleImageLoaded } = 
    usePlayerImage({ 
      player, 
      onImageFixed
    });

  // Handle image load event
  const handleImageLoadComplete = () => {
    handleImageLoaded();
    onImageLoaded?.();
  };

  if (!player) {
    return (
      <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-gray-100 border-2 border-flu-verde flex items-center justify-center">
        <p className="text-gray-500">Aguardando jogador...</p>
      </div>
    );
  }

  console.log(`🎨 Renderizando imagem para ${player.name}: ${imageSrc}`);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      <ImageLoader isLoading={isLoading && !imageError} />
      <ImageErrorDisplay imageError={imageError} />
      
      <div className="w-full h-full flex items-center justify-center p-2 relative">
        {imageSrc ? (
          <OptimizedImage
            src={imageSrc}
            alt={`Imagem de ${player.name}`}
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            width={400}
            height={450}
            priority={true}
            onLoad={() => {
              console.log(`🎉 Evento onLoad para ${player.name}`);
              handleImageLoadComplete();
            }}
            onError={() => {
              console.error(`🚫 Evento onError para ${player.name}`);
              handleImageError();
            }}
            fallback="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500">Carregando imagem...</p>
          </div>
        )}
      </div>
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
