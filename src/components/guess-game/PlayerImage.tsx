
import { useState } from "react";
import { defaultPlayerImage } from "@/utils/playerImageUtils";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
}

export const PlayerImage = ({ player, onImageFixed }: PlayerImageProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'}`);
    if (!imageError) {
      setImageError(true);
      // Automatically trigger the image fixed function if there's an error
      onImageFixed();
    }
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden">
      {imageError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">Carregando imagem alternativa...</p>
          </div>
        </div>
      ) : (
        <img
          src={player?.image_url || defaultPlayerImage}
          alt="Jogador"
          className="w-full h-full object-cover transition-all duration-500"
          onError={handleImageError}
        />
      )}
    </div>
  );
};
