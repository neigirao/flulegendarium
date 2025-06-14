
import { useState, useEffect } from "react";
import { defaultPlayerImage, playerImagesFallbacksMap } from "@/utils/player-image";

interface UsePlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
  onImageLoaded?: () => void; // Nova prop para notificar carregamento
}

export function usePlayerImage({ player, onImageFixed, onImageLoaded }: UsePlayerImageProps) {
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
      
      if (player.name && playerImagesFallbacksMap[player.name]) {
        setImageSrc(playerImagesFallbacksMap[player.name]);
      } else {
        setImageSrc(player.image_url || defaultPlayerImage);
      }
    } else {
      setImageSrc(null);
    }
  }, [player?.id, player?.name]);

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'} (tentativa ${retryCount + 1})`);
    
    if (retryCount === 0) {
      setRetryCount(prev => prev + 1);
      
      if (player?.name) {
        if (playerImagesFallbacksMap[player.name]) {
          console.log(`Tentando fallback para ${player.name}`);
          setImageSrc(playerImagesFallbacksMap[player.name]);
          setIsLoading(true);
          return;
        }
        
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
    
    if (retryCount === 1) {
      console.log("Usando imagem padrão como último recurso");
      setImageSrc(defaultPlayerImage);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      onImageFixed();
      return;
    }
    
    setImageError(true);
    setIsLoading(false);
    onImageFixed();
  };

  const handleImageLoaded = () => {
    console.log(`✅ Imagem carregada com sucesso: ${player?.name}`);
    setIsLoading(false);
    // Notificar que a imagem foi carregada
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
