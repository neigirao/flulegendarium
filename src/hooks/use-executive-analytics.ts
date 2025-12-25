import { useQuery } from "@tanstack/react-query";
import { executiveAnalyticsService } from "@/services/executiveAnalyticsService";

export const useExecutiveAnalytics = (days: number = 30) => {
  const { data: funnelData = [], isLoading: isLoadingFunnel } = useQuery({
    queryKey: ['executive-funnel', days],
    queryFn: () => executiveAnalyticsService.getFunnelData(days),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const { data: heatmapData = [], isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ['executive-heatmap', days],
    queryFn: () => executiveAnalyticsService.getActivityHeatmap(days),
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const { data: playerDifficulty, isLoading: isLoadingDifficulty } = useQuery({
    queryKey: ['executive-player-difficulty'],
    queryFn: () => executiveAnalyticsService.getPlayerDifficultyAnalysis(),
    staleTime: 15 * 60 * 1000,
    retry: 2
  });

  const { data: scoreDistribution = [], isLoading: isLoadingScores } = useQuery({
    queryKey: ['executive-score-distribution'],
    queryFn: () => executiveAnalyticsService.getScoreDistribution(),
    staleTime: 15 * 60 * 1000,
    retry: 2
  });

  return {
    funnelData,
    heatmapData,
    playerDifficulty,
    scoreDistribution,
    isLoading: isLoadingFunnel || isLoadingHeatmap || isLoadingDifficulty || isLoadingScores,
    isLoadingFunnel,
    isLoadingHeatmap,
    isLoadingDifficulty,
    isLoadingScores
  };
};
