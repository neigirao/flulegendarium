import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";

export const useReports = (days: number = 30) => {
  const { data: userEngagementData = [], isLoading: isLoadingEngagement } = useQuery({
    queryKey: ['user-engagement-report', days],
    queryFn: () => reportsService.getUserEngagementReport(days),
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const { data: npsData = [], isLoading: isLoadingNPS } = useQuery({
    queryKey: ['nps-report', days],
    queryFn: () => reportsService.getNPSReport(days),
    staleTime: 15 * 60 * 1000,
    retry: 2
  });

  const { data: errorMetrics = [], isLoading: isLoadingErrors } = useQuery({
    queryKey: ['error-metrics-report', Math.min(days, 30)],
    queryFn: () => reportsService.getErrorMetricsReport(Math.min(days, 30)),
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const { data: supportTickets = [], isLoading: isLoadingSupport } = useQuery({
    queryKey: ['support-tickets-report', days],
    queryFn: () => reportsService.getSupportTicketsReport(days),
    staleTime: 15 * 60 * 1000,
    retry: 2
  });

  const { data: feedbackData = [], isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['feedback-report', days],
    queryFn: () => reportsService.getFeedbackReport(days),
    staleTime: 15 * 60 * 1000,
    retry: 2
  });

  return {
    userEngagementData,
    npsData,
    errorMetrics,
    supportTickets,
    feedbackData,
    isLoading: isLoadingEngagement || isLoadingNPS || 
               isLoadingErrors || isLoadingSupport || isLoadingFeedback,
    isLoadingEngagement,
    isLoadingNPS,
    isLoadingErrors,
    isLoadingSupport,
    isLoadingFeedback
  };
};
