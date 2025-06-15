
import { useQuery } from "@tanstack/react-query";
import { useCacheManager } from "./use-cache-manager";
import { useOptimizedQueries } from "./use-optimized-queries";

export const useRankingStats = () => {
  const { getCacheConfig } = useCacheManager();
  const { getRankings } = useOptimizedQueries();

  const { data: playerRanking = [], isLoading } = useQuery({
    queryKey: ['admin-rankings'],
    queryFn: async () => {
      try {
        const data = await getRankings(50);
        console.log('✅ Rankings carregados:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ Erro ao buscar rankings:', error);
        return [];
      }
    },
    ...getCacheConfig('medium')
  });

  return { playerRanking, isLoading };
};
