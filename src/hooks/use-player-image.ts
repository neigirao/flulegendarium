
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
  const [retryCount, setRetryCount] = useState(0);

  // Reset states and set image source when player changes
  useEffect(() => {
    if (player) {
      console.log(`🖼️ Iniciando carregamento da imagem para: ${player.name}`);
      console.log(`🔗 URL original: ${player.image_url}`);
      
      setImageError(false);
      setIsLoading(true);
      setRetryCount(0);
      
      // First try: use fallback map if available
      if (player.name && playerImagesFallbacksMap[player.name]) {
        console.log(`✅ Usando fallback para ${player.name}: ${playerImagesFallbacksMap[player.name]}`);
        setImageSrc(playerImagesFallbacksMap[player.name]);
      } 
      // Second try: use original URL if it looks valid
      else if (player.image_url && (player.image_url.startsWith('http://') || player.image_url.startsWith('https://'))) {
        console.log(`📍 Usando URL original para ${player.name}`);
        setImageSrc(player.image_url);
      }
      // Third try: search for partial matches in fallback map
      else {
        let fallbackFound = false;
        for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
          if (player.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(player.name.toLowerCase())) {
            console.log(`🔍 Fallback por similaridade para ${player.name}: ${url}`);
            setImageSrc(url);
            fallbackFound = true;
            break;
          }
        }
        
        // Last resort: use default image
        if (!fallbackFound) {
          console.log(`⚠️ Usando imagem padrão para ${player.name}`);
          setImageSrc(defaultPlayerImage);
        }
      }
    } else {
      setImageSrc(null);
    }
  }, [player?.id, player?.name]);

  const handleImageError = () => {
    console.error(`❌ Erro no carregamento da imagem para ${player?.name || 'jogador desconhecido'} (tentativa ${retryCount + 1})`);
    console.error(`🔗 URL que falhou: ${imageSrc}`);
    
    if (retryCount === 0) {
      setRetryCount(prev => prev + 1);
      
      // Try fallback for exact match
      if (player?.name && playerImagesFallbacksMap[player.name] && imageSrc !== playerImagesFallbacksMap[player.name]) {
        console.log(`🔄 Tentando fallback exato para ${player.name}`);
        setImageSrc(playerImagesFallbacksMap[player.name]);
        setIsLoading(true);
        return;
      }
      
      // Try fallback for partial match
      if (player?.name) {
        for (const [key, url] of Object.entries(playerImagesFallbacksMap)) {
          if ((player.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(player.name.toLowerCase())) && imageSrc !== url) {
            console.log(`🔄 Tentando fallback por similaridade para ${player.name}: ${url}`);
            setImageSrc(url);
            setIsLoading(true);
            return;
          }
        }
      }
    }
    
    if (retryCount === 1 && imageSrc !== defaultPlayerImage) {
      console.log(`🔄 Usando imagem padrão como último recurso para ${player?.name}`);
      setImageSrc(defaultPlayerImage);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      onImageFixed();
      return;
    }
    
    // All attempts failed
    console.error(`💥 Todas as tentativas falharam para ${player?.name}`);
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
