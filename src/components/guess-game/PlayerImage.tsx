
import { useState } from "react";
import { defaultPlayerImage } from "@/utils/playerImageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
}

export const PlayerImage = ({ player, onImageFixed }: PlayerImageProps) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [isFixingImage, setIsFixingImage] = useState(false);

  // Function to fix player image when there's an error
  const fixPlayerImage = async () => {
    if (!player || isFixingImage) return;
    
    try {
      setIsFixingImage(true);
      
      // Use default image as fallback
      const newUrl = defaultPlayerImage;
      
      await supabase
        .from('players')
        .update({ image_url: newUrl })
        .eq('id', player.id);
      
      // Notify parent component
      onImageFixed();
      
      // Reset error state
      setImageError(false);
      
      toast({
        title: "Imagem corrigida",
        description: "A imagem do jogador foi atualizada.",
      });
    } catch (err) {
      console.error("Erro ao corrigir imagem:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível corrigir a imagem."
      });
    } finally {
      setIsFixingImage(false);
    }
  };

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem para ${player?.name || 'jogador desconhecido'}`);
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden">
      {imageError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">Erro ao carregar imagem</p>
            <button
              onClick={fixPlayerImage}
              className="bg-flu-grena text-white px-4 py-2 rounded-lg text-sm"
              disabled={isFixingImage}
            >
              {isFixingImage ? "Corrigindo..." : "Corrigir imagem"}
            </button>
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
      <button
        onClick={fixPlayerImage}
        className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        title="Corrigir imagem"
        disabled={isFixingImage}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFixingImage ? "animate-spin" : ""}>
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>
    </div>
  );
};
