
import { useState, memo, useEffect, useRef } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cleanup function for observer
  const cleanupObserver = () => {
    if (observerRef.current && imgRef.current) {
      observerRef.current.unobserve(imgRef.current);
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    cleanupObserver();

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && imgRef.current) {
        // Set high priority when visible
        if (imgRef.current) {
          imgRef.current.fetchPriority = "high";
          
          // Force browser to load the image if it hasn't already
          if (imgRef.current.complete === false) {
            const currentSrc = imgRef.current.src;
            imgRef.current.src = currentSrc;
          }
        }
        
        // Cleanup observer once image is visible
        cleanupObserver();
      }
    }, {
      rootMargin: "200px", // Start loading when within 200px of viewport
      threshold: 0.1
    });
    
    observerRef.current.observe(imgRef.current);
    
    return cleanupObserver;
  }, [imageSrc]);

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

  // Reset states and set image source when player changes
  useEffect(() => {
    if (player) {
      setImageError(false);
      setIsLoading(true);
      setRetryCount(0);
      
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
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'} (tentativa ${retryCount + 1})`);
    
    // First retry - check for fallbacks
    if (retryCount === 0) {
      setRetryCount(prev => prev + 1);
      
      // Try to find fallback by player name
      if (player?.name) {
        // First try exact match
        if (playerImagesFallbacksMap[player.name]) {
          console.log(`Tentando fallback exato para ${player.name}`);
          setImageSrc(playerImagesFallbacksMap[player.name]);
          setIsLoading(true);
          return;
        }
        
        // Then try partial match
        for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
          if (player.name.includes(key) || key.includes(player.name)) {
            console.log(`Tentando fallback parcial: ${key} para ${player.name}`);
            setImageSrc(url);
            setIsLoading(true);
            return;
          }
        }
      }
    }
    
    // Second retry - use default image
    if (retryCount === 1) {
      console.log("Usando imagem padrão como último recurso");
      setImageSrc(defaultPlayerImage);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      onImageFixed();
      return;
    }
    
    // Final failure - just show error state
    setImageError(true);
    setIsLoading(false);
    onImageFixed();
  };

  const handleImageLoaded = () => {
    console.log(`Imagem carregada com sucesso: ${player?.name}`);
    setIsLoading(false);
  };

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
      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 text-flu-grena animate-spin" />
            <p className="text-sm text-gray-600 animate-pulse">Carregando imagem...</p>
          </div>
        </div>
      )}
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <p className="text-flu-grena font-medium">Não foi possível carregar a imagem</p>
            <p className="text-sm text-gray-600">Prossiga com o jogo normalmente</p>
          </div>
        </div>
      )}
      
      <div className="w-full h-full flex items-center justify-center p-2 relative">
        <img
          ref={imgRef}
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
