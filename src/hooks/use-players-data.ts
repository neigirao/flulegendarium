
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
  console.log("🔄 usePlayersData INICIANDO...");

  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: async (): Promise<Player[]> => {
      console.log("🔍 usePlayersData - EXECUTANDO QUERY...");
      
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name');
        
        console.log("🔍 usePlayersData - RESPOSTA DA QUERY:", {
          dataLength: data?.length || 0,
          hasError: !!error,
          error: error?.message || 'nenhum',
          primeirosItens: data ? data.slice(0, 3).map(p => ({ id: p.id, name: p.name })) : 'N/A'
        });
        
        if (error) {
          console.error("❌ usePlayersData - ERRO NA QUERY:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn("⚠️ usePlayersData - NENHUM DADO RETORNADO");
          return [];
        }

        console.log(`✅ usePlayersData - ${data.length} jogadores RAW encontrados`);
        
        const processedPlayers = data
          .filter((player: DatabasePlayer) => {
            const isValid = player.id && player.name;
            if (!isValid) {
              console.warn('⚠️ Jogador inválido filtrado:', player);
            }
            return isValid;
          })
          .map((player: DatabasePlayer): Player => {
            const processed = {
              id: player.id,
              name: player.name || 'Jogador Desconhecido',
              position: player.position || 'Posição não informada',
              image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
              year_highlight: player.year_highlight || '',
              fun_fact: player.fun_fact || '',
              achievements: Array.isArray(player.achievements) ? player.achievements : [],
              nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
              statistics: convertStatistics(player.statistics)
            };
            
            console.log(`✅ Jogador processado: ${processed.name} (${processed.id})`);
            return processed;
          });

        console.log(`✅ usePlayersData - ${processedPlayers.length} jogadores PROCESSADOS`);
        console.log("✅ usePlayersData - PRIMEIROS 3 PROCESSADOS:", 
          processedPlayers.slice(0, 3).map(p => ({ 
            name: p.name, 
            id: p.id, 
            image_url: p.image_url?.substring(0, 50) + '...' 
          }))
        );
        
        return processedPlayers;
      } catch (error) {
        console.error("❌ usePlayersData - ERRO GERAL:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  console.log("📊 usePlayersData RESULTADO FINAL:", {
    playersCount: players?.length || 0,
    playersType: typeof players,
    isArray: Array.isArray(players),
    isLoading,
    hasError: !!error,
    primeirosNomes: players?.slice(0, 3).map(p => p.name) || 'N/A'
  });

  return {
    players: players || [],
    isLoading,
    error
  };
};
