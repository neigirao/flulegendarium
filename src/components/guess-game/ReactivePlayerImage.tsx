
import { useState, memo, useCallback, useEffect, useRef } from "react";
import { Player } from "@/types/guess-game";
import { MobileOptimizedImage } from "@/components/mobile/MobileOptimizedImage";

interface ReactivePlayerImageProps {
  player: Player;
  gameKey: string; // Force re-render when this changes
  onImageLoaded?: () => void;
}

export const ReactivePlayerImage = memo(({ 
  player, 
  gameKey,
  onImageLoaded 
}: ReactivePlayerImageProps) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const previousPlayerIdRef = useRef<string>("");

  // Reset states when player or gameKey changes
  useEffect(() => {
    if (player.id !== previousPlayerIdRef.current) {
      console.log('🔄 Novo jogador detectado, resetando estados:', player.name);
      setImageError(false);
      setIsLoaded(false);
      previousPlayerIdRef.current = player.id;
    }
  }, [player.id, gameKey]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Imagem carregada:', player.name, 'Key:', gameKey);
    setImageError(false);
    setIsLoaded(true);
    onImageLoaded?.();
  }, [player.name, gameKey, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ Erro ao carregar imagem:', player.name, 'URL:', player.image_url);
    setImageError(true);
    setIsLoaded(true);
  }, [player.name, player.image_url]);

  const imageSrc = imageError || !player.image_url 
    ? "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png"
    : player.image_url;

  console.log('🖼️ Renderizando ReactivePlayerImage:', {
    playerName: player.name,
    playerId: player.id,
    gameKey,
    imageSrc,
    isLoaded,
    imageError
  });

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <MobileOptimizedImage
        key={`${player.id}-${gameKey}`} // Force re-mount on player/game change
        src={imageSrc}
        alt={`Imagem de ${player.name}`}
        className="shadow-md hover:shadow-lg border-2 border-flu-verde"
        aspectRatio={4/5}
        priority={true}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* Loading indicator */}
      {!isLoaded && !imageError && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm animate-pulse">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
            Carregando imagem...
          </div>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            Usando escudo padrão
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs border">
          <p><strong>Debug ReactivePlayerImage:</strong></p>
          <p>Player: {player.name} ({player.id})</p>
          <p>Game Key: {gameKey}</p>
          <p>Loaded: {isLoaded ? 'SIM' : 'NÃO'}</p>
          <p>Error: {imageError ? 'SIM' : 'NÃO'}</p>
          <p className="break-all">URL: {player.image_url}</p>
        </div>
      )}
    </div>
  );
});

ReactivePlayerImage.displayName = 'ReactivePlayerImage';
