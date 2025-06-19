
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
  console.log("🔄 usePlayersData iniciando...");

  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: async (): Promise<Player[]> => {
      console.log("🔍 Buscando jogadores...");
      
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name');
        
        if (error) {
          console.error("❌ Erro na query:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn("⚠️ Nenhum jogador encontrado");
          return [];
        }

        console.log(`✅ ${data.length} jogadores encontrados`);
        
        const processedPlayers = data
          .filter((player: DatabasePlayer) => player.id && player.name)
          .map((player: DatabasePlayer): Player => ({
            id: player.id,
            name: player.name || 'Jogador Desconhecido',
            position: player.position || 'Posição não informada',
            image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
            year_highlight: player.year_highlight || '',
            fun_fact: player.fun_fact || '',
            achievements: Array.isArray(player.achievements) ? player.achievements : [],
            nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
            statistics: convertStatistics(player.statistics)
          }));

        console.log(`✅ ${processedPlayers.length} jogadores processados`);
        return processedPlayers;
      } catch (error) {
        console.error("❌ Erro ao buscar jogadores:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  console.log("📊 usePlayersData resultado:", {
    playersCount: players?.length || 0,
    isLoading,
    hasError: !!error
  });

  return {
    players: players || [],
    isLoading,
    error
  };
};
