import { useGeneralStats } from "./admin-stats/use-general-stats";
import { useRankingStats } from "./admin-stats/use-ranking-stats";
import { useProgressStats } from "./admin-stats/use-progress-stats";
import { useCacheManager } from "./admin-stats/use-cache-manager";
import { useEffect } from "react";

export const useAdminStats = () => {
  const { generalStats, isLoading: generalLoading, successRate } = useGeneralStats();
  const { playerRanking, isLoading: rankingLoading } = useRankingStats();
  const { progressStats, isLoading: progressLoading } = useProgressStats();
  const { prefetchRelatedData } = useCacheManager();

  const isLoading = generalLoading || rankingLoading || progressLoading;

  // Prefetch dados relacionados quando o componente monta
  useEffect(() => {
    prefetchRelatedData();
  }, [prefetchRelatedData]);

  return {
    playerRanking,
    progressStats,
    generalStats,
    successRate,
    isLoading
  };
};
