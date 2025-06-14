
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
  const [isLoading, setIsLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Reset states when player changes
  useEffect(() => {
    if (player) {
      console.log(`🖼️ Carregando imagem para: ${player.name}`);
      setImageError(false);
      setIsLoading(true);
      
      // Start with the player's original image
      setImageSrc(player.image_url || defaultPlayerImage);
    } else {
      setImageSrc(null);
      setIsLoading(false);
      setImageError(false);
    }
  }, [player?.id]);

  const getFallbackImage = (playerName: string): string => {
    // Check for exact match first
    if (playerImagesFallbacksMap[playerName]) {
      console.log(`✅ Fallback exato encontrado para ${playerName}`);
      return playerImagesFallbacksMap[playerName];
    }
    
    // Check for partial matches (case insensitive)
    const normalizedPlayerName = playerName.toLowerCase().trim();
    for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
      const normalizedKey = key.toLowerCase().trim();
      if (normalizedPlayerName.includes(normalizedKey) || 
          normalizedKey.includes(normalizedPlayerName)) {
        console.log(`🔍 Fallback por similaridade para ${playerName}: ${key}`);
        return url;
      }
    }
    
    console.log(`🛡️ Usando imagem padrão para ${playerName}`);
    return defaultPlayerImage;
  };

  const handleImageError = () => {
    if (!player) {
      setImageError(true);
      setIsLoading(false);
      return;
    }

    console.error(`❌ Erro no carregamento para ${player.name}`);
    
    // Try fallback image
    if (imageSrc !== defaultPlayerImage) {
      const fallbackUrl = getFallbackImage(player.name);
      console.log(`🔄 Tentando fallback para ${player.name}: ${fallbackUrl}`);
      setImageSrc(fallbackUrl);
      onImageFixed();
    } else {
      // If even default image fails, show error
      console.log(`💥 Falha total para ${player.name}`);
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoaded = () => {
    console.log(`✅ Imagem carregada com sucesso para ${player?.name}`);
    setIsLoading(false);
    setImageError(false);
  };

  return {
    imageError,
    isLoading,
    imageSrc,
    handleImageError,
    handleImageLoaded
  };
}
