
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankingStats = () => {
  const { data: playerRanking = [], isLoading } = useQuery({
    queryKey: ['admin-rankings'],
    queryFn: async () => {
      try {
        console.log('🏆 Buscando rankings otimizados...');
        
        const { data, error } = await supabase
          .from('rankings')
          .select('id, player_name, score, games_played, created_at')
          .order('score', { ascending: false })
          .limit(50); // Limitar para melhor performance
        
        if (error) {
          console.error('❌ Erro ao buscar rankings:', error);
          return [];
        }
        
        console.log('✅ Rankings carregados:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ Erro nos rankings:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  return { playerRanking, isLoading };
};
