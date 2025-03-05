import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { defaultPlayerImage } from "@/utils/playerImageUtils";

interface PlayerStatistics {
  gols: number;
  jogos: number;
}

export interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    image_url: string;
    fun_fact: string;
    achievements: string[];
    year_highlight: string;
    statistics: PlayerStatistics;
  };
  onImageUpdate: (playerId: string, newImageUrl: string) => void;
}

export const PlayerCard = ({ player, onImageUpdate }: PlayerCardProps) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [isFixingImage, setIsFixingImage] = useState(false);

  const fixPlayerImage = async () => {
    if (isFixingImage) return; // Prevent multiple simultaneous corrections
    
    try {
      setIsFixingImage(true);
      
      // Usar a imagem padrão como fallback
      const newImageUrl = defaultPlayerImage;
      
      const { error } = await supabase
        .from('players')
        .update({ image_url: newImageUrl })
        .eq('id', player.id);
      
      if (error) throw error;
      
      // Notificar o componente pai sobre a atualização
      onImageUpdate(player.id, newImageUrl);
      
      // Resetar o estado de erro
      setImageError(false);
      
      toast({
        title: "Imagem corrigida",
        description: `A imagem de ${player.name} foi atualizada com sucesso.`,
      });
    } catch (err) {
      console.error(`Erro ao atualizar imagem do jogador ${player.name}:`, err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível corrigir a imagem de ${player.name}.`,
      });
    } finally {
      setIsFixingImage(false);
    }
  };

  const handleImageError = () => {
    console.error(`Erro ao carregar imagem para ${player.name}`);
    if (!imageError) {
      setImageError(true);
    }
  };
  
  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-20 h-20 rounded-md overflow-hidden shrink-0 relative">
          {imageError ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <button
                onClick={fixPlayerImage}
                className="text-xs text-flu-grena p-1"
                disabled={isFixingImage}
              >
                {isFixingImage ? "Corrigindo..." : "Corrigir"}
              </button>
            </div>
          ) : (
            <img 
              src={player.image_url || defaultPlayerImage} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-0 right-0 bg-white/80 w-6 h-6 p-1"
            onClick={fixPlayerImage}
            disabled={isFixingImage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </Button>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{player.name}</h3>
          <p className="text-sm text-muted-foreground">Posição: {player.position}</p>
          <p className="text-sm text-muted-foreground">Ano de destaque: {player.year_highlight}</p>
          <p className="mt-2 text-sm">{player.fun_fact}</p>
          {player.statistics && (
            <p className="text-sm mt-1">
              Estatísticas: {player.statistics.gols} gols em {player.statistics.jogos} jogos
            </p>
          )}
          {player.achievements && player.achievements.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium">Conquistas:</p>
              <ul className="list-disc list-inside text-xs">
                {player.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
