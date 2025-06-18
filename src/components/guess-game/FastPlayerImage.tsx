
import { useState, useCallback, useEffect } from "react";
import { Player } from "@/types/guess-game";

interface FastPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const FastPlayerImage = ({ player, onImageLoaded }: FastPlayerImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string>("");

  // Definir imagem padrão
  const defaultImage = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";

  // Reset quando o jogador muda
  useEffect(() => {
    console.log('🔄 Novo jogador detectado:', player.name);
    setImageError(false);
    setIsLoading(true);
    
    // Determinar qual imagem usar
    const imageToUse = (player.image_url && player.image_url.trim()) ? player.image_url : defaultImage;
    setImageSrc(imageToUse);
    
    console.log('📸 Imagem a ser carregada:', imageToUse);
  }, [player.id, player.image_url]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Imagem carregada com sucesso:', player.name);
    setIsLoading(false);
    setImageError(false);
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ Erro ao carregar imagem:', player.name, imageSrc);
    
    // Se não estava usando a imagem padrão, tenta usar ela
    if (imageSrc !== defaultImage) {
      console.log('🛡️ Tentando imagem de fallback:', defaultImage);
      setImageSrc(defaultImage);
      setImageError(false);
    } else {
      console.error('❌ Erro mesmo com imagem padrão');
      setImageError(true);
      setIsLoading(false);
    }
  }, [player.name, imageSrc, defaultImage]);

  return (
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/5', minHeight: '300px' }}>
        {/* Estado de carregamento */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Carregando...</span>
            </div>
          </div>
        )}

        {/* Estado de erro */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <div className="text-4xl">⚽</div>
              <span className="text-sm">Imagem não disponível</span>
            </div>
          </div>
        )}

        {/* Imagem */}
        <img
          key={`${player.id}-${imageSrc}`}
          src={imageSrc}
          alt={`Foto de ${player.name}`}
          className="w-full h-full object-contain shadow-md border-2 border-flu-verde rounded-lg"
          loading="eager"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: (isLoading || imageError) ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>

      {/* Indicador quando usando fallback */}
      {!imageError && imageSrc === defaultImage && player.image_url && (
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
          <p><strong>Debug:</strong></p>
          <p>Jogador: {player.name}</p>
          <p>URL Original: {player.image_url || 'não definida'}</p>
          <p>URL Atual: {imageSrc}</p>
          <p>Status: {imageError ? 'ERRO' : isLoading ? 'CARREGANDO' : 'CARREGADA'}</p>
        </div>
      )}
    </div>
  );
};
