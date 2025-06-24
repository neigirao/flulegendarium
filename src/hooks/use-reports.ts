
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";

export const useReports = () => {
  const { data: userEngagementData = [], isLoading: isLoadingEngagement } = useQuery({
    queryKey: ['user-engagement-report'],
    queryFn: () => reportsService.getUserEngagementReport(30),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });

  const { data: performanceMetrics = [], isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['performance-metrics-report'],
    queryFn: () => reportsService.getPerformanceMetricsReport(7),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });

  const { data: npsData = [], isLoading: isLoadingNPS } = useQuery({
    queryKey: ['nps-report'],
    queryFn: () => reportsService.getNPSReport(30),
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 2
  });

  const { data: errorMetrics = [], isLoading: isLoadingErrors } = useQuery({
    queryKey: ['error-metrics-report'],
    queryFn: () => reportsService.getErrorMetricsReport(7),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });

  const { data: supportTickets = [], isLoading: isLoadingSupport } = useQuery({
    queryKey: ['support-tickets-report'],
    queryFn: () => reportsService.getSupportTicketsReport(30),
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 2
  });

  const { data: feedbackData = [], isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['feedback-report'],
    queryFn: () => reportsService.getFeedbackReport(30),
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 2
  });

  return {
    userEngagementData,
    performanceMetrics,
    npsData,
    errorMetrics,
    supportTickets,
    feedbackData,
    isLoading: isLoadingEngagement || isLoadingPerformance || isLoadingNPS || 
               isLoadingErrors || isLoadingSupport || isLoadingFeedback,
    isLoadingEngagement,
    isLoadingPerformance,
    isLoadingNPS,
    isLoadingErrors,
    isLoadingSupport,
    isLoadingFeedback
  };
};
