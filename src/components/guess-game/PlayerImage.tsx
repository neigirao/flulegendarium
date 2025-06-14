import { memo, useRef, useEffect, useState } from "react";
import { defaultPlayerImage, playerImagesFallbacksMap } from "@/utils/player-image";
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

// Function to convert image URL to WebP if supported
const getOptimizedImageUrl = (url: string): string => {
  // Check if browser supports WebP
  const supportsWebP = (() => {
    const elem = document.createElement('canvas');
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  if (!supportsWebP) return url;
  
  // For external URLs, we'll keep the original format
  // In a real app, you'd use a service like Cloudinary or ImageKit
  return url;
};

// Memoized component to prevent unnecessary re-renders
export const PlayerImage = memo(({ player, onImageFixed }: PlayerImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);
  const { imageError, isLoading, imageSrc, handleImageError, handleImageLoaded } = 
    usePlayerImage({ player, onImageFixed });
  const { cleanupObserver } = useImageObserver(imgRef);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  const optimizedImageSrc = getOptimizedImageUrl(imageSrc);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      <ImageLoader isLoading={isLoading && !imageError} />
      <ImageErrorDisplay imageError={imageError} />
      
      <div className="w-full h-full flex items-center justify-center p-2 relative">
        {isInView && (
          <img
            ref={imgRef}
            src={optimizedImageSrc}
            alt="Imagem do jogador" // Generic alt text without revealing player name
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoaded}
            loading="lazy" 
            decoding="async"
            // Add referrerpolicy to prevent leaking origin information
            referrerPolicy="no-referrer"
            // Disable right-click menu on image
            onContextMenu={(e) => e.preventDefault()}
            // Disable dragging of image to prevent revealing URL
            draggable="false"
          />
        )}
      </div>
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
