
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

  // Reset states and set image source when player changes
  useEffect(() => {
    if (player) {
      console.log(`🖼️ Carregando imagem para: ${player.name}`);
      
      setImageError(false);
      setIsLoading(true);
      
      // Determine the best image source
      let imageUrl = defaultPlayerImage; // Start with default
      
      // Check if we have a fallback for this player
      if (playerImagesFallbacksMap[player.name]) {
        imageUrl = playerImagesFallbacksMap[player.name];
        console.log(`✅ Usando fallback para ${player.name}: ${imageUrl}`);
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
      
      setImageSrc(imageUrl);
    } else {
      setImageSrc(null);
    }
  }, [player?.id, player?.name]);

  const handleImageError = () => {
    console.error(`❌ Erro no carregamento da imagem para ${player?.name}`);
    
    // If not already using default, switch to it
    if (imageSrc !== defaultPlayerImage) {
      console.log(`🔄 Usando imagem padrão para ${player?.name}`);
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
