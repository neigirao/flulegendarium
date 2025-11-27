
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCacheManager } from "./use-cache-manager";
import { useOptimizedQueries } from "./use-optimized-queries";
import { logger } from "@/utils/logger";

interface ProgressStat {
  step: number;
  count: number;
}

export const useProgressStats = () => {
  const { getCacheConfig } = useCacheManager();
  const { getProgressData } = useOptimizedQueries();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin-progress-stats'],
    queryFn: async () => {
      try {
        const data = await getProgressData();
        logger.info('Sessões carregadas', 'PROGRESS_STATS', { count: data?.length || 0 });
        return data || [];
      } catch (error) {
        logger.error('Erro nas estatísticas de progresso', 'PROGRESS_STATS', error);
        return [];
      }
    },
    ...getCacheConfig('medium')
  });

  const progressStats = useMemo((): ProgressStat[] => {
    if (!sessions || sessions.length === 0) {
      return [];
    }
    
    const stepCounts: Record<number, number> = sessions.reduce((acc, session) => {
      const step = session.total_correct || 0;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.entries(stepCounts)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step)
      .slice(0, 20);
  }, [sessions]);

  return { progressStats, isLoading };
};
