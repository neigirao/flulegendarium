
import { useGeneralStats } from "./admin-stats/use-general-stats";
import { usePlayerStats } from "./admin-stats/use-player-stats";
import { useRankingStats } from "./admin-stats/use-ranking-stats";
import { useProgressStats } from "./admin-stats/use-progress-stats";
import { useCacheManager } from "./admin-stats/use-cache-manager";
import { useEffect } from "react";

export const useAdminStats = () => {
  const { generalStats, isLoading: generalLoading } = useGeneralStats();
  const { mostCorrectPlayers, mostMissedPlayers, successRate, isLoading: playerLoading } = usePlayerStats();
  const { playerRanking, isLoading: rankingLoading } = useRankingStats();
  const { progressStats, isLoading: progressLoading } = useProgressStats();
  const { prefetchRelatedData } = useCacheManager();

  const isLoading = generalLoading || playerLoading || rankingLoading || progressLoading;

  // Prefetch dados relacionados quando o componente monta
  useEffect(() => {
    prefetchRelatedData();
  }, [prefetchRelatedData]);

  return {
    mostCorrectPlayers,
    mostMissedPlayers,
    playerRanking,
    progressStats,
    generalStats,
    successRate,
    isLoading
  };
};
