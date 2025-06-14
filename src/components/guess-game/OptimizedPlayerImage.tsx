
import { Player } from "@/types/guess-game";
import { LazyImage } from "@/components/performance/LazyImage";
import { usePlayerImage } from "@/hooks/use-player-image";
import { cn } from "@/lib/utils";

interface OptimizedPlayerImageProps {
  player: Player | null;
  onImageFixed: () => void;
  onImageLoaded?: () => void;
  priority?: boolean;
}

export const OptimizedPlayerImage = ({ 
  player, 
  onImageFixed, 
  onImageLoaded,
  priority = false 
}: OptimizedPlayerImageProps) => {
  const { imageError, isLoading, imageSrc, handleImageError, handleImageLoaded } = usePlayerImage({
    player,
    onImageFixed
  });

  const handleLoad = () => {
    handleImageLoaded();
    onImageLoaded?.();
  };

  if (!player || !imageSrc) {
    return (
      <div className="player-image-container w-full max-w-md mx-auto">
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div>Carregando jogador...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-image-container w-full max-w-md mx-auto mb-6">
      <div className="relative">
        <LazyImage
          src={imageSrc}
          alt={`Foto de ${player.name}`}
          className={cn(
            "w-full aspect-square rounded-xl shadow-2xl border-4 border-white",
            "transition-all duration-300 hover:scale-105",
            isLoading && "opacity-75"
          )}
          width={400}
          height={400}
          priority={priority}
          onLoad={handleLoad}
          onError={handleImageError}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin" />
              <p className="text-flu-grena font-medium">Carregando...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold text-gray-700">
          Quem é este jogador?
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Digite o nome ou apelido
        </p>
      </div>
    </div>
  );
};
