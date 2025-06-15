
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  retry: number;
  refetchOnWindowFocus: boolean;
}

export const useCacheManager = () => {
  const queryClient = useQueryClient();

  // Configurações de cache otimizadas por tipo de dado
  const getCacheConfig = useCallback((type: 'fast' | 'medium' | 'slow'): CacheConfig => {
    const configs = {
      fast: {
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        retry: 1,
        refetchOnWindowFocus: true
      },
      medium: {
        staleTime: 2 * 60 * 1000, // 2 minutos
        gcTime: 5 * 60 * 1000, // 5 minutos
        retry: 2,
        refetchOnWindowFocus: false
      },
      slow: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 2,
        refetchOnWindowFocus: false
      }
    };
    return configs[type];
  }, []);

  // Invalidar caches relacionados
  const invalidateStats = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-general-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-player-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-rankings'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-progress-stats'] })
    ]);
  }, [queryClient]);

  // Prefetch de dados relacionados
  const prefetchRelatedData = useCallback(async () => {
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['admin-rankings'],
        staleTime: getCacheConfig('medium').staleTime
      }),
      queryClient.prefetchQuery({
        queryKey: ['admin-progress-stats'],
        staleTime: getCacheConfig('slow').staleTime
      })
    ];
    
    await Promise.allSettled(prefetchPromises);
  }, [queryClient, getCacheConfig]);

  return {
    getCacheConfig,
    invalidateStats,
    prefetchRelatedData
  };
};
