
import { useState, useCallback, memo } from "react";
import { Player } from "@/types/guess-game";

interface RobustPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
}

export const RobustPlayerImage = memo(({ player, onImageLoaded }: RobustPlayerImageProps) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>(player.image_url);

  console.log('🖼️ RobustPlayerImage render:', {
    player: player.name,
    imageState,
    currentSrc: currentSrc?.substring(0, 50) + '...'
  });

  const handleImageLoad = useCallback(() => {
    console.log('✅ RobustPlayerImage - Imagem carregada:', player.name);
    setImageState('loaded');
    onImageLoaded?.();
  }, [player.name, onImageLoaded]);

  const handleImageError = useCallback(() => {
    console.error('❌ RobustPlayerImage - Erro na imagem:', player.name);
    
    // Try fallback to default image
    const fallbackImage = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
    
    if (currentSrc !== fallbackImage) {
      console.log('🔄 Tentando imagem padrão para:', player.name);
      setCurrentSrc(fallbackImage);
      setImageState('loading');
    } else {
      console.log('💥 Falha total na imagem para:', player.name);
      setImageState('error');
    }
  }, [player.name, currentSrc]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-white rounded-lg shadow-lg border-2 border-flu-verde overflow-hidden">
        
        {/* Loading State */}
        {imageState === 'loading' && (
          <div className="aspect-[4/5] min-h-[300px] flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-flu-verde border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Carregando imagem...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {imageState === 'error' && (
          <div className="aspect-[4/5] min-h-[300px] flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <img 
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                alt="Escudo do Fluminense" 
                className="w-16 h-16 mx-auto mb-2 opacity-50"
              />
              <p className="text-gray-600 text-sm">Imagem não disponível</p>
              <p className="text-xs text-gray-500 mt-1">Continue jogando normalmente</p>
            </div>
          </div>
        )}

        {/* Image */}
        <div className={`aspect-[4/5] min-h-[300px] flex items-center justify-center p-4 ${
          imageState === 'loaded' ? 'block' : 'hidden'
        }`}>
          <img
            key={`${player.id}-${currentSrc}`}
            src={currentSrc}
            alt={`Jogador ${player.name}`}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              display: imageState === 'loaded' ? 'block' : 'none',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        </div>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p><strong>Debug RobustPlayerImage:</strong></p>
          <p>Player: {player.name}</p>
          <p>State: {imageState}</p>
          <p>Src: {currentSrc}</p>
        </div>
      )}
    </div>
  );
});

RobustPlayerImage.displayName = 'RobustPlayerImage';
