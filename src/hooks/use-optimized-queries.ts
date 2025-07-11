import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "./use-error-handler";

interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

export const useOptimizedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config: QueryConfig = {}
) => {
  const { handleError } = useErrorHandler({ logToConsole: false });
  
  return useQuery({
    queryKey,
    queryFn,
    staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutos default
    gcTime: config.cacheTime || 10 * 60 * 1000, // 10 minutos default
    refetchOnWindowFocus: config.refetchOnWindowFocus ?? false,
    retry: config.retry ?? 1,
    onError: (error: Error) => {
      handleError(error, `Query: ${queryKey.join('/')}`);
    }
  } as UseQueryOptions<T, Error>);
};

// Queries otimizadas específicas
export const useGameStats = () => {
  return useOptimizedQuery(
    ['game-stats-optimized'],
    async () => {
      const [sessionsResponse, attemptsResponse, playersResponse] = await Promise.all([
        supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('game_attempts').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true })
      ]);
      
      return {
        totalGames: sessionsResponse.count || 0,
        totalAttempts: attemptsResponse.count || 0,
        totalPlayers: playersResponse.count || 0
      };
    },
    { staleTime: 10 * 60 * 1000 } // Cache por 10 minutos para stats
  );
};

export const useDecades = () => {
  return useOptimizedQuery(
    ['decades-optimized'],
    async () => {
      const { data: playersData, error } = await supabase
        .from('players')
        .select('decades')
        .not('decades', 'is', null);
      
      if (error) throw error;
      
      const decades = new Set<string>();
      playersData?.forEach(player => {
        if (player.decades && Array.isArray(player.decades)) {
          player.decades.forEach((decade: string) => decades.add(decade));
        }
      });
      
      return Array.from(decades).sort();
    },
    { staleTime: 30 * 60 * 1000 } // Cache por 30 minutos
  );
};