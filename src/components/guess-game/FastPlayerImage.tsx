
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
    console.log('🔄 FastPlayerImage: Resetando estado para novo jogador -', player.name);
    setImageError(false);
    setIsLoading(true);
  }, [player.id]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ FastPlayerImage: Imagem carregada com sucesso -', player.name);
    setIsLoading(false);
    setImageError(false);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ FastPlayerImage: Erro ao carregar imagem -', player.name, player.image_url);
    setIsLoading(false);
    setImageError(true);
  }, [player.name, player.image_url]);

  // Determinar qual imagem usar
  const getImageSrc = () => {
    if (imageError || !player.image_url?.trim()) {
      console.log('🛡️ Usando imagem padrão para:', player.name);
      return "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
    }
    return player.image_url;
  };

  const imageSrc = getImageSrc();

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/5', minHeight: '300px' }}>
        {/* Estado de carregamento */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Carregando imagem...</span>
            </div>
          </div>
        )}

        <img
          key={`${player.id}-${Date.now()}`}
          src={imageSrc}
          alt={`Foto de ${player.name}`}
          className="w-full h-full object-contain shadow-md border-2 border-flu-verde rounded-lg"
          loading="eager"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>

      {/* Indicador de fallback */}
      {imageError && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Usando escudo do Fluminense
          </div>
        </div>
      )}

      {/* Debug info apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs border">
          <p><strong>Debug FastPlayerImage:</strong></p>
          <p>Jogador: {player.name}</p>
          <p>Status: {imageError ? 'ERRO (usando fallback)' : isLoading ? 'CARREGANDO' : 'CARREGADA'}</p>
          <p>URL Original: {player.image_url || 'não definida'}</p>
          <p>URL Atual: {imageSrc}</p>
        </div>
      )}
    </div>
  );
};
