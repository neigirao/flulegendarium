
import { useState, useEffect } from "react";
import { defaultPlayerImage, playerImagesFallbacksMap } from "@/utils/player-image";

interface UsePlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
}

export function usePlayerImage({ player, onImageFixed }: UsePlayerImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
    // Log error without revealing the exact URL
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'} (tentativa ${retryCount + 1})`);
    
    // First retry - check for fallbacks
    if (retryCount === 0) {
      setRetryCount(prev => prev + 1);
      
      // Try to find fallback by player name
      if (player?.name) {
        // First try exact match
        if (playerImagesFallbacksMap[player.name]) {
          console.log(`Tentando fallback para ${player.name}`);
          setImageSrc(playerImagesFallbacksMap[player.name]);
          setIsLoading(true);
          return;
        }
        
        // Then try partial match
        for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
          if (player.name.includes(key) || key.includes(player.name)) {
            console.log(`Tentando fallback para ${player.name}`);
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

  return {
    imageError,
    isLoading,
    imageSrc,
    handleImageError,
    handleImageLoaded
  };
}
