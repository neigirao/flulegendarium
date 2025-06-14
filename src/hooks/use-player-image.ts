
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
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  // Reset states and set image source when player changes
  useEffect(() => {
    if (player) {
      console.log(`🖼️ Carregando imagem para: ${player.name}`);
      console.log(`🔗 URL original: ${player.image_url}`);
      
      setImageError(false);
      setIsLoading(true);
      setFallbackAttempted(false);
      
      // Priority: try original image first, but validate URL
      let imageUrl = player.image_url;
      
      // If original URL is obviously invalid or empty, try fallback immediately
      if (!imageUrl || 
          imageUrl === defaultPlayerImage || 
          imageUrl === "" || 
          imageUrl === "undefined" ||
          imageUrl === "null") {
        console.log(`⚠️ URL inválida para ${player.name}, tentando fallback`);
        imageUrl = getFallbackImage(player.name);
      }
      
      setImageSrc(imageUrl);
      console.log(`🎯 URL final para ${player.name}: ${imageUrl}`);
    } else {
      setImageSrc(null);
      setIsLoading(false);
    }
  }, [player?.id, player?.name, player?.image_url]);

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
    
    // Return default as last resort
    console.log(`🛡️ Usando imagem padrão para ${playerName}`);
    return defaultPlayerImage;
  };

  const handleImageError = () => {
    console.error(`❌ Erro no carregamento da imagem para ${player?.name}: ${imageSrc}`);
    
    if (!player) {
      setImageError(true);
      setIsLoading(false);
      return;
    }
    
    // If we haven't tried fallback yet and current image is the original
    if (!fallbackAttempted && imageSrc === player.image_url) {
      setFallbackAttempted(true);
      
      const fallbackUrl = getFallbackImage(player.name);
      if (fallbackUrl !== imageSrc && fallbackUrl !== defaultPlayerImage) {
        console.log(`🔄 Tentando fallback para ${player.name}: ${fallbackUrl}`);
        setImageSrc(fallbackUrl);
        setIsLoading(true);
        onImageFixed();
        return;
      }
    }
    
    // If even fallback failed, use default
    if (imageSrc !== defaultPlayerImage) {
      console.log(`🛡️ Usando imagem padrão como último recurso para ${player?.name}`);
      setImageSrc(defaultPlayerImage);
      setIsLoading(true);
      onImageFixed();
      return;
    }
    
    // If all failed, show error state but continue
    console.log(`💥 Todas as tentativas falharam para ${player?.name}`);
    setImageError(true);
    setIsLoading(false);
    onImageFixed();
  };

  const handleImageLoaded = () => {
    console.log(`✅ Imagem carregada com sucesso para ${player?.name}: ${imageSrc}`);
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
