
import { useQuery } from "@tanstack/react-query";
import { useCacheManager } from "./use-cache-manager";
import { useOptimizedQueries } from "./use-optimized-queries";
import { logger } from "@/utils/logger";

export const useRankingStats = () => {
  const { getCacheConfig } = useCacheManager();
  const { getRankings } = useOptimizedQueries();

  const { data: playerRanking = [], isLoading } = useQuery({
    queryKey: ['admin-rankings'],
    queryFn: async () => {
      try {
        const data = await getRankings(50);
        logger.info('Rankings carregados', 'RANKING_STATS', { count: data?.length || 0 });
        return data || [];
      } catch (error) {
        logger.error('Erro ao buscar rankings', 'RANKING_STATS', error);
        return [];
      }
    },
    ...getCacheConfig('medium')
  });

  return { playerRanking, isLoading };
};
