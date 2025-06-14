
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/guess-game";
import { convertStatistics } from "@/utils/statistics-converter";

export const usePlayersData = () => {
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        console.log("🔍 Buscando jogadores no banco...");
        
        const { data, error } = await supabase
          .from('players')
          .select('*');
        
        if (error) {
          console.error("❌ Erro ao buscar jogadores:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn("⚠️ Nenhum jogador encontrado");
          return [] as Player[];
        }

        console.log("✅ Jogadores carregados:", data.length);
        
        const enhancedPlayers: Player[] = data.map((player) => {
          const enhancedPlayer: Player = {
            id: player.id,
            name: player.name || 'Nome não informado',
            position: player.position || 'Posição não informada',
            image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
            year_highlight: player.year_highlight || '',
            fun_fact: player.fun_fact || '',
            achievements: Array.isArray(player.achievements) ? player.achievements : [],
            nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
            statistics: convertStatistics(player.statistics)
          };
          
          return enhancedPlayer;
        });
        
        console.log("🎯 Primeiro jogador processado:", enhancedPlayers[0]?.name);
        return enhancedPlayers;
      } catch (err) {
        console.error("💥 Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    players,
    isLoading,
    playersError
  };
};
