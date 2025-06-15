
import { useQuery } from "@tanstack/react-query";
import { useCacheManager } from "./use-cache-manager";
import { useOptimizedQueries } from "./use-optimized-queries";

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
        console.log('✅ Estatísticas gerais carregadas:', stats);
        return stats;
      } catch (error) {
        console.error('❌ Erro nas estatísticas gerais:', error);
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

  return { generalStats, isLoading };
};
