
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { advancedAnalyticsService, TimeSeriesData, PlayerInsight, SocialComparison, PerformancePattern } from "@/services/advancedAnalyticsService";

export const useUserAnalytics = () => {
  const { user } = useAuth();

  const { data: timeSeriesData = [], isLoading: isLoadingTimeSeries } = useQuery({
    queryKey: ['user-time-series', user?.id],
    queryFn: () => advancedAnalyticsService.getTimeSeriesData(user!.id, 30),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: socialComparison, isLoading: isLoadingSocial } = useQuery({
    queryKey: ['user-social-comparison', user?.id],
    queryFn: () => advancedAnalyticsService.getSocialComparison(user!.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ['user-insights', user?.id],
    queryFn: () => advancedAnalyticsService.generateInsights(user!.id),
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
  });

  const { data: performancePatterns, isLoading: isLoadingPatterns } = useQuery({
    queryKey: ['user-patterns', user?.id],
    queryFn: () => advancedAnalyticsService.getPerformancePatterns(user!.id),
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
  });

  return {
    timeSeriesData,
    socialComparison,
    insights,
    performancePatterns,
    isLoading: isLoadingTimeSeries || isLoadingSocial || isLoadingInsights || isLoadingPatterns,
    isLoadingTimeSeries,
    isLoadingSocial,
    isLoadingInsights,
    isLoadingPatterns
  };
};
