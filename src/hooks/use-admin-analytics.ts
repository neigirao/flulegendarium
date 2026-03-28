import { useQuery } from "@tanstack/react-query";
import { adminBusinessIntelligence } from "@/services/adminBusinessIntelligence";
import { executiveAnalyticsService } from "@/services/executiveAnalyticsService";

/**
 * Unified admin analytics hook.
 * Merges: use-business-intelligence + use-executive-analytics
 * 
 * Lazy-loaded only in admin dashboards.
 */
export const useAdminAnalytics = (days: number = 30) => {
  const { data: operationalMetrics = [], isLoading: isLoadingOperational } = useQuery({
    queryKey: ['admin-operational-metrics'],
    queryFn: () => adminBusinessIntelligence.getOperationalMetrics(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchInterval: 5 * 60 * 1000
  });

  const { data: businessMetrics, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['admin-business-metrics', days],
    queryFn: () => adminBusinessIntelligence.getBusinessMetrics(days),
    staleTime: 15 * 60 * 1000,
    retry: 2
  });

  // ─── Executive Analytics (from use-executive-analytics) ───
  const { data: funnelData = [], isLoading: isLoadingFunnel } = useQuery({
    queryKey: ['executive-funnel', days],
    queryFn: () => executiveAnalyticsService.getFunnelData(days),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const { data: retentionMetrics, isLoading: isLoadingRetention } = useQuery({
    queryKey: ['executive-retention', days],
    queryFn: () => executiveAnalyticsService.getRetentionMetrics(days),
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
    // Business Intelligence
    operationalMetrics,
    businessMetrics,
    isLoadingOperational,
    isLoadingBusiness,
    // Executive Analytics
    funnelData,
    retentionMetrics: retentionMetrics || { playAgainRate: 0, averageSessionsPerUser: 0, returningUsers: 0 },
    heatmapData,
    playerDifficulty,
    scoreDistribution,
    isLoadingFunnel,
    isLoadingRetention,
    isLoadingHeatmap,
    isLoadingDifficulty,
    isLoadingScores,
    // Combined loading
    isLoading: isLoadingOperational || isLoadingBusiness ||
               isLoadingFunnel || isLoadingHeatmap || isLoadingDifficulty || isLoadingScores,
  };
};
