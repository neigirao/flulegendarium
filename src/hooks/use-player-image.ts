
import { useState, useEffect } from "react";
import { defaultPlayerImage, playerImagesFallbacksMap } from "@/utils/player-image";

interface UsePlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
  onImageLoaded?: () => void;
}

export function usePlayerImage({ player, onImageFixed, onImageLoaded }: UsePlayerImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  // Reset states and set image source when player changes
  useEffect(() => {
    if (player) {
      console.log(`🖼️ Carregando imagem para: ${player.name}`);
      
      setImageError(false);
      setIsLoading(true);
      setFallbackAttempted(false);
      
      // Priority: original image_url first, then fallback, then default
      let imageUrl = player.image_url;
      
      // If original URL is invalid or empty, try fallback immediately
      if (!imageUrl || 
          imageUrl === defaultPlayerImage || 
          !(imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
        
        // Check if we have a specific fallback for this player
        if (playerImagesFallbacksMap[player.name]) {
          imageUrl = playerImagesFallbacksMap[player.name];
          console.log(`✅ Usando fallback específico para ${player.name}: ${imageUrl}`);
        } 
        // Check for partial matches
        else {
          for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
            if (player.name.toLowerCase().includes(key.toLowerCase()) || 
                key.toLowerCase().includes(player.name.toLowerCase())) {
              imageUrl = url;
              console.log(`🔍 Fallback por similaridade para ${player.name}: ${url}`);
              break;
            }
          }
        }
      }
      
      setImageSrc(imageUrl);
      console.log(`🎯 URL final para ${player.name}: ${imageUrl}`);
    } else {
      setImageSrc(null);
    }
  }, [player?.id, player?.name]);

  const handleImageError = () => {
    console.error(`❌ Erro no carregamento da imagem para ${player?.name}: ${imageSrc}`);
    
    // If we haven't tried fallback yet and current image is not a fallback
    if (!fallbackAttempted && player && imageSrc === player.image_url) {
      setFallbackAttempted(true);
      
      // Try specific fallback
      if (playerImagesFallbacksMap[player.name]) {
        const fallbackUrl = playerImagesFallbacksMap[player.name];
        console.log(`🔄 Tentando fallback específico para ${player.name}: ${fallbackUrl}`);
        setImageSrc(fallbackUrl);
        setIsLoading(true);
        onImageFixed();
        return;
      }
      
      // Try partial match fallback
      for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
        if (player.name.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(player.name.toLowerCase())) {
          console.log(`🔄 Tentando fallback por similaridade para ${player.name}: ${url}`);
          setImageSrc(url);
          setIsLoading(true);
          onImageFixed();
          return;
        }
      }
    }
    
    // Only use default image as absolute last resort
    if (imageSrc !== defaultPlayerImage) {
      console.log(`🛡️ Usando imagem padrão como último recurso para ${player?.name}`);
      setImageSrc(defaultPlayerImage);
      setIsLoading(true);
      onImageFixed();
      return;
    }
    
    // If even default failed, show error
    console.error(`💥 Falha total no carregamento para ${player?.name}`);
    setImageError(true);
    setIsLoading(false);
    onImageFixed();
  };

  const handleImageLoaded = () => {
    console.log(`✅ Imagem carregada com sucesso para ${player?.name}: ${imageSrc}`);
    setIsLoading(false);
    setImageError(false);
    
    if (onImageLoaded) {
      onImageLoaded();
    }
  };

  return {
    imageError,
    isLoading,
    imageSrc,
    handleImageError,
    handleImageLoaded
  };
}
