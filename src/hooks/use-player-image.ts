
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
  const [currentAttempt, setCurrentAttempt] = useState(0);

  // Reset states when player changes
  useEffect(() => {
    if (player) {
      console.log(`🖼️ Iniciando carregamento para: ${player.name}`);
      setImageError(false);
      setIsLoading(true);
      setCurrentAttempt(0);
      
      // Try original image first
      setImageSrc(player.image_url);
    } else {
      setImageSrc(null);
      setIsLoading(false);
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

    console.error(`❌ Erro no carregamento (tentativa ${currentAttempt + 1}) para ${player.name}`);
    
    const nextAttempt = currentAttempt + 1;
    
    if (nextAttempt === 1) {
      // First error: try fallback image
      const fallbackUrl = getFallbackImage(player.name);
      console.log(`🔄 Tentando fallback para ${player.name}: ${fallbackUrl}`);
      setImageSrc(fallbackUrl);
      setCurrentAttempt(nextAttempt);
      onImageFixed();
    } else if (nextAttempt === 2) {
      // Second error: try default image
      console.log(`🛡️ Tentando imagem padrão para ${player.name}`);
      setImageSrc(defaultPlayerImage);
      setCurrentAttempt(nextAttempt);
      onImageFixed();
    } else {
      // Final fallback: show error state
      console.log(`💥 Todas as tentativas falharam para ${player.name}`);
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
