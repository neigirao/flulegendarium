
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePreload } from "@/hooks/use-preload";
import { 
  getReliableImageUrl, 
  preloadPlayerImages, 
  preloadNextPlayer, 
  prepareNextBatch 
} from "@/utils/player-image";
import { Player } from "@/types/guess-game";
import { convertStatistics } from "@/utils/statistics-converter";

export const usePlayersData = () => {
  const { preloadImages } = usePreload();

  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        console.log("Iniciando busca de jogadores...");
        
        const { data, error } = await supabase
          .from('players')
          .select('*');
        
        if (error) {
          console.error("Erro ao buscar jogadores:", error);
          throw error;
        }
        
        console.log("Jogadores carregados com sucesso:", data?.length || 0, "jogadores");
        
        if (!data || data.length === 0) {
          console.warn("Nenhum jogador encontrado na base de dados");
          return [] as Player[];
        }

        console.log("Primeiro jogador:", data[0].name);
        
        const enhancedPlayers: Player[] = data.map((player) => {
          try {
            // Convert the player data to proper Player type with robust statistics conversion
            const enhancedPlayer: Player = {
              id: player.id,
              name: player.name || 'Nome não informado',
              position: player.position || 'Posição não informada',
              image_url: player.image_url || '',
              year_highlight: player.year_highlight || '',
              fun_fact: player.fun_fact || '',
              achievements: Array.isArray(player.achievements) ? player.achievements : [],
              nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
              statistics: convertStatistics(player.statistics)
            };
            
            // Now enhance the image URL
            enhancedPlayer.image_url = getReliableImageUrl(enhancedPlayer);
            
            return enhancedPlayer;
          } catch (playerError) {
            console.error(`Erro ao processar jogador ${player.name}:`, playerError);
            // Return a fallback player object
            return {
              id: player.id,
              name: player.name || 'Nome não informado',
              position: player.position || 'Posição não informada',
              image_url: getReliableImageUrl({ 
                id: player.id, 
                name: player.name || 'Nome não informado',
                image_url: player.image_url || ''
              } as Player),
              year_highlight: '',
              fun_fact: '',
              achievements: [],
              nicknames: [],
              statistics: { gols: 0, jogos: 0 }
            };
          }
        });
        
        return enhancedPlayers;
      } catch (err) {
        console.error("Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Preload player images when data is loaded
  useEffect(() => {
    if (players && players.length > 0) {
      preloadPlayerImages(players);
      
      const imagesToPreload = players
        .slice(0, 8)
        .map(player => getReliableImageUrl(player));
      
      preloadImages(imagesToPreload);
      
      if (players.length > 8) {
        const batchSize = 5;
        for (let i = 8; i < players.length; i += batchSize) {
          const batch = players.slice(i, i + batchSize);
          const delay = (i - 8) * 1000;
          
          setTimeout(() => {
            console.log(`Iniciando pré-carregamento em background de lote ${i / batchSize + 1}`);
            batch.forEach((player) => {
              const img = new Image();
              img.src = getReliableImageUrl(player);
              img.fetchPriority = 'low';
            });
          }, delay);
        }
      }
    }
  }, [players, preloadImages]);

  return {
    players,
    isLoading,
    playersError
  };
};
