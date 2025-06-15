
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
        console.log('📊 Buscando estatísticas gerais...');
        
        const [gameStartsResult, sessionsResult, playersResult, attemptsResult] = await Promise.all([
          supabase.from('game_starts').select('*', { count: 'exact', head: true }),
          supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
          supabase.from('players').select('*', { count: 'exact', head: true }),
          supabase.from('game_attempts').select('is_correct')
        ]);
        
        const correctAttempts = attemptsResult.data?.filter(a => a.is_correct === true).length || 0;
        
        return {
          totalAttempts: gameStartsResult.count || 0,
          totalSessions: sessionsResult.count || 0,
          totalPlayers: playersResult.count || 0,
          correctAttempts
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
    staleTime: 2 * 60 * 1000,
    retry: 1
  });

  return { generalStats, isLoading };
};
