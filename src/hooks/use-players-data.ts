
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/guess-game";
import { convertStatistics } from "@/utils/statistics-converter";

interface DatabasePlayer {
  id: string;
  name: string | null;
  position: string | null;
  image_url: string;
  year_highlight: string | null;
  fun_fact: string | null;
  achievements: string[] | null;
  nicknames: string[] | null;
  statistics: any;
}

export const usePlayersData = () => {
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async (): Promise<Player[]> => {
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
          console.warn("⚠️ Nenhum jogador encontrado no banco");
          return [] as Player[];
        }

        console.log("✅ Jogadores carregados do banco:", data.length);
        
        const enhancedPlayers: Player[] = data.map((player: DatabasePlayer) => {
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
          
          console.log(`🎯 Jogador processado: ${enhancedPlayer.name} - ${enhancedPlayer.image_url}`);
          return enhancedPlayer;
        });
        
        console.log("🎮 Total de jogadores processados:", enhancedPlayers.length);
        return enhancedPlayers;
      } catch (err) {
        console.error("💥 Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors  
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  console.log("🔄 Hook usePlayersData - Players:", players?.length || 0, "Loading:", isLoading, "Error:", !!playersError);

  return {
    players,
    isLoading,
    playersError
  };
};
