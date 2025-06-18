
import { useState, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";

interface FastPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const FastPlayerImage = ({ player, onImageLoaded }: FastPlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset quando o jogador muda
  useEffect(() => {
    console.log('🔄 FastPlayerImage: Novo jogador -', player.name);
    setImageError(false);
    setIsLoading(true);
  }, [player.id]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ FastPlayerImage: Imagem carregada -', player.name);
    setIsLoading(false);
    setImageError(false);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ FastPlayerImage: Erro na imagem -', player.name, player.image_url);
    setIsLoading(false);
    setImageError(true);
  }, [player.name, player.image_url]);

  // Usar imagem padrão se houver erro ou URL vazia
  const imageSrc = imageError || !player.image_url 
    ? "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png"
    : player.image_url;

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/5', minHeight: '300px' }}>
        {/* Estado de carregamento */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Carregando...</span>
            </div>
          </div>
        )}

        <img
          key={`${player.id}-${imageSrc}`}
          src={imageSrc}
          alt={`Imagem de ${player.name}`}
          className="w-full h-full object-contain shadow-md border-2 border-flu-verde rounded-lg"
          loading="eager"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            display: isLoading ? 'none' : 'block'
          }}
        />
      </div>

      {/* Indicador de erro */}
      {imageError && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Usando escudo do Fluminense
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs border">
          <p><strong>FastImage:</strong> {player.name}</p>
          <p>Status: {imageError ? 'ERRO' : isLoading ? 'CARREGANDO' : 'OK'}</p>
          <p className="break-all">URL: {imageSrc}</p>
        </div>
      )}
    </div>
  );
};
