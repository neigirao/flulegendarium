
import { useGeneralStats } from "./admin-stats/use-general-stats";
import { usePlayerStats } from "./admin-stats/use-player-stats";
import { useRankingStats } from "./admin-stats/use-ranking-stats";
import { useProgressStats } from "./admin-stats/use-progress-stats";

export const useAdminStats = () => {
  const { generalStats, isLoading: generalLoading } = useGeneralStats();
  const { mostCorrectPlayers, mostMissedPlayers, successRate, isLoading: playerLoading } = usePlayerStats();
  const { playerRanking, isLoading: rankingLoading } = useRankingStats();
  const { progressStats, isLoading: progressLoading } = useProgressStats();

  const isLoading = generalLoading || playerLoading || rankingLoading || progressLoading;

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
