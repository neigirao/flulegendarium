import { useQuery } from "@tanstack/react-query";
import { adminBusinessIntelligence, UserSegment, CohortData, OperationalMetric, BusinessMetrics } from "@/services/adminBusinessIntelligence";

export const useBusinessIntelligence = (days: number = 30) => {
  const { data: userSegments = [], isLoading: isLoadingSegments } = useQuery({
    queryKey: ['admin-user-segments', days],
    queryFn: () => adminBusinessIntelligence.getUserSegments(days),
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const { data: cohortAnalysis = [], isLoading: isLoadingCohorts } = useQuery({
    queryKey: ['admin-cohort-analysis'],
    queryFn: () => adminBusinessIntelligence.getCohortAnalysis(),
    staleTime: 30 * 60 * 1000,
    retry: 2
  });

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

  return {
    userSegments,
    cohortAnalysis,
    operationalMetrics,
    businessMetrics,
    isLoading: isLoadingSegments || isLoadingCohorts || isLoadingOperational || isLoadingBusiness,
    isLoadingSegments,
    isLoadingCohorts,
    isLoadingOperational,
    isLoadingBusiness
  };
};
