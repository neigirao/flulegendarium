import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCacheManager } from "./use-cache-manager";
import { useOptimizedQueries } from "./use-optimized-queries";
import { logger } from "@/utils/logger";

interface GeneralStats {
  totalAttempts: number;
  totalSessions: number;
  totalPlayers: number;
  correctAttempts: number;
}

export const useGeneralStats = () => {
  const { getCacheConfig } = useCacheManager();
  const { getGeneralCounts } = useOptimizedQueries();

  const { data: generalStats, isLoading } = useQuery({
    queryKey: ['admin-general-stats'],
    queryFn: async (): Promise<GeneralStats> => {
      try {
        const stats = await getGeneralCounts();
        logger.info('Estatísticas gerais carregadas', 'ADMIN_STATS', stats);
        return stats;
      } catch (error) {
        logger.error('Erro nas estatísticas gerais', 'ADMIN_STATS', error);
        return {
          totalAttempts: 0,
          totalSessions: 0,
          totalPlayers: 0,
          correctAttempts: 0
        };
      }
    },
    ...getCacheConfig('slow')
  });

  const successRate = useMemo(() => {
    if (!generalStats || generalStats.totalAttempts === 0) return '0';
    return ((generalStats.correctAttempts / generalStats.totalAttempts) * 100).toFixed(1);
  }, [generalStats]);

  return { generalStats, isLoading, successRate };
};
