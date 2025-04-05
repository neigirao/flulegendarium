
import { memo, useRef, useEffect } from "react";
import { defaultPlayerImage, playerImagesFallbacksMap } from "@/utils/playerImageUtils";
import { usePlayerImage } from "@/hooks/use-player-image";
import { useImageObserver } from "@/hooks/use-image-observer";
import { ImageLoader } from "./ImageLoader";
import { ImageErrorDisplay } from "./ImageErrorDisplay";

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
  const imgRef = useRef<HTMLImageElement>(null);
  const { imageError, isLoading, imageSrc, handleImageError, handleImageLoaded } = 
    usePlayerImage({ player, onImageFixed });
  const { cleanupObserver } = useImageObserver(imgRef);

  // Set up effect to observe image
  useEffect(() => {
    // Component cleanup
    return () => cleanupObserver();
  }, [cleanupObserver]);

  // Prefetch fallback images when component mounts
  useEffect(() => {
    // Prefetch default image
    const prefetchDefault = new Image();
    prefetchDefault.src = defaultPlayerImage;
    
    // Prefetch some fallbacks
    Object.values(playerImagesFallbacksMap).slice(0, 5).forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Early return for no image source
  if (!imageSrc) {
    return (
      <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-gray-100 border-2 border-flu-verde flex items-center justify-center">
        <p className="text-gray-500">Imagem não disponível</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      <ImageLoader isLoading={isLoading && !imageError} />
      <ImageErrorDisplay imageError={imageError} />
      
      <div className="w-full h-full flex items-center justify-center p-2 relative">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Imagem do jogador" // Generic alt text without revealing player name
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoaded}
          loading="eager" 
          decoding="async"
          fetchPriority="high"
          // Add referrerpolicy to prevent leaking origin information
          referrerPolicy="no-referrer"
          // Disable right-click menu on image
          onContextMenu={(e) => e.preventDefault()}
          // Disable dragging of image to prevent revealing URL
          draggable="false"
        />
      </div>
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
