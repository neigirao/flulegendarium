
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankingStats = () => {
  const { data: playerRanking = [], isLoading } = useQuery({
    queryKey: ['admin-rankings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('rankings')
          .select('*')
          .order('score', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('❌ Erro ao buscar rankings:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1
  });

  return { playerRanking, isLoading };
};
