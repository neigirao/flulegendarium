
import { memo, useRef, useEffect } from "react";
import { usePlayerImage } from "@/hooks/use-player-image";
import { ImageLoader } from "./ImageLoader";
import { ImageErrorDisplay } from "./ImageErrorDisplay";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { PlayerImageSkeleton } from "@/components/ui/skeleton-loader";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
  onImageLoaded?: () => void;
  priority?: boolean;
}

export const PlayerImage = memo(({ player, onImageFixed, onImageLoaded, priority = false }: PlayerImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
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
    return <PlayerImageSkeleton />;
  }

  console.log(`🎨 Renderizando imagem para ${player.name}: ${imageSrc}`);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[450px] rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      <ImageLoader isLoading={isLoading && !imageError} />
      <ImageErrorDisplay imageError={imageError} />
      
      <div className="w-full h-full flex items-center justify-center p-2 md:p-3 lg:p-4 relative">
        {imageSrc ? (
          <OptimizedImage
            src={imageSrc}
            alt={`Imagem de ${player.name}`}
            width={400}
            height={400}
            priority={priority}
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={() => {
              console.error(`🚫 Evento onError para ${player.name}`);
              handleImageError();
            }}
            onLoad={() => {
              console.log(`🎉 Evento onLoad para ${player.name}`);
              handleImageLoadComplete();
            }}
            fallbackSrc="/placeholder.svg"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500 text-sm md:text-base">Carregando imagem...</p>
          </div>
        )}
      </div>
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
