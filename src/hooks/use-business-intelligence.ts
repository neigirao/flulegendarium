
import { useQuery } from "@tanstack/react-query";
import { adminBusinessIntelligence, UserSegment, CohortData, OperationalMetric, BusinessMetrics } from "@/services/adminBusinessIntelligence";

export const useBusinessIntelligence = () => {
  const { data: userSegments = [], isLoading: isLoadingSegments } = useQuery({
    queryKey: ['admin-user-segments'],
    queryFn: () => adminBusinessIntelligence.getUserSegments(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });

  const { data: cohortAnalysis = [], isLoading: isLoadingCohorts } = useQuery({
    queryKey: ['admin-cohort-analysis'],
    queryFn: () => adminBusinessIntelligence.getCohortAnalysis(),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  });

  const { data: operationalMetrics = [], isLoading: isLoadingOperational } = useQuery({
    queryKey: ['admin-operational-metrics'],
    queryFn: () => adminBusinessIntelligence.getOperationalMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchInterval: 5 * 60 * 1000 // Auto-refresh a cada 5 minutos
  });

  const { data: businessMetrics, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['admin-business-metrics'],
    queryFn: () => adminBusinessIntelligence.getBusinessMetrics(),
    staleTime: 15 * 60 * 1000, // 15 minutos
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
