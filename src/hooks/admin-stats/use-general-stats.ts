
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GeneralStats {
  totalAttempts: number;
  totalSessions: number;
  totalPlayers: number;
  correctAttempts: number;
}

export const useGeneralStats = () => {
  const { data: generalStats, isLoading } = useQuery({
    queryKey: ['admin-general-stats'],
    queryFn: async (): Promise<GeneralStats> => {
      try {
        console.log('📊 Buscando estatísticas gerais otimizadas...');
        
        // Query otimizada usando aggregate functions do PostgreSQL
        const { data: statsData, error } = await supabase.rpc('get_admin_general_stats');
        
        if (error) {
          console.error('❌ Erro na função RPC, usando fallback:', error);
          // Fallback para queries individuais mais otimizadas
          const [attemptsResult, sessionsResult, playersResult, correctResult] = await Promise.all([
            supabase.from('game_starts').select('*', { count: 'exact', head: true }),
            supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
            supabase.from('players').select('*', { count: 'exact', head: true }),
            supabase.from('game_attempts').select('*', { count: 'exact' }).eq('is_correct', true)
          ]);
          
          return {
            totalAttempts: attemptsResult.count || 0,
            totalSessions: sessionsResult.count || 0,
            totalPlayers: playersResult.count || 0,
            correctAttempts: correctResult.count || 0
          };
        }
        
        return statsData || {
          totalAttempts: 0,
          totalSessions: 0,
          totalPlayers: 0,
          correctAttempts: 0
        };
      } catch (error) {
        console.error('❌ Erro nas estatísticas gerais:', error);
        return {
          totalAttempts: 0,
          totalSessions: 0,
          totalPlayers: 0,
          correctAttempts: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos no garbage collector
    retry: 2,
    refetchOnWindowFocus: false
  });

  return { generalStats, isLoading };
};
