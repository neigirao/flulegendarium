
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface PlayerStats {
  player_name: string;
  correct_count: number;
}

interface MostMissedPlayer {
  player_name: string;
  missed_count: number;
  total_attempts: number;
  miss_rate: string;
}

interface ProgressStat {
  step: number;
  count: number;
}

interface GeneralStats {
  totalAttempts: number;
  totalSessions: number;
  totalPlayers: number;
  correctAttempts: number;
}

interface AllStatsData {
  attempts: any[];
  sessions: any[];
  players: any[];
  rankings: any[];
  gameStarts: any[];
}

export const useAdminStats = () => {
  // Single optimized query to fetch all data at once
  const { data: allStats, isLoading, error } = useQuery({
    queryKey: ['admin-stats-all'],
    queryFn: async (): Promise<AllStatsData> => {
      try {
        console.log('📊 Buscando estatísticas administrativas...');
        
        const [attemptsResult, sessionsResult, playersResult, rankingsResult, gameStartsResult] = await Promise.all([
          supabase.from('game_attempts').select('*'),
          supabase.from('game_sessions').select('*'),
          supabase.from('players').select('*', { count: 'exact', head: true }),
          supabase.from('rankings').select('*').order('score', { ascending: false }),
          supabase.from('game_starts').select('*')
        ]);
        
        console.log('📊 Resultados das consultas:');
        console.log('- Tentativas:', attemptsResult.data?.length || 0, attemptsResult.error ? 'ERRO' : 'OK');
        console.log('- Sessões:', sessionsResult.data?.length || 0, sessionsResult.error ? 'ERRO' : 'OK');
        console.log('- Players count:', playersResult.count, playersResult.error ? 'ERRO' : 'OK');
        console.log('- Rankings:', rankingsResult.data?.length || 0, rankingsResult.error ? 'ERRO' : 'OK');
        console.log('- Game starts:', gameStartsResult.data?.length || 0, gameStartsResult.error ? 'ERRO' : 'OK');
        
        // Log sample data for debugging
        if (attemptsResult.data && attemptsResult.data.length > 0) {
          console.log('📊 Amostra de tentativas:', attemptsResult.data.slice(0, 3));
        }
        
        if (sessionsResult.data && sessionsResult.data.length > 0) {
          console.log('📊 Amostra de sessões:', sessionsResult.data.slice(0, 3));
        }
        
        return {
          attempts: attemptsResult.data || [],
          sessions: sessionsResult.data || [],
          players: [],
          rankings: rankingsResult.data || [],
          gameStarts: gameStartsResult.data || []
        };
      } catch (error) {
        console.error('❌ Erro nas consultas administrativas:', error);
        return {
          attempts: [],
          sessions: [],
          players: [],
          rankings: [],
          gameStarts: []
        };
      }
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Get players count separately
  const { data: playersCount } = useQuery({
    queryKey: ['players-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('❌ Erro ao buscar contagem de jogadores:', error);
          return 0;
        }
        
        console.log('👥 Contagem de jogadores:', count);
        return count || 0;
      } catch (error) {
        console.error('❌ Erro na consulta de contagem:', error);
        return 0;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1
  });

  // Memoized calculations
  const mostCorrectPlayers = useMemo((): PlayerStats[] => {
    if (!allStats?.attempts || allStats.attempts.length === 0) {
      console.log('⚠️ Nenhuma tentativa para calcular jogadores mais acertados');
      return [];
    }
    
    console.log('🏆 Calculando jogadores mais acertados com', allStats.attempts.length, 'tentativas');
    
    const correctAttempts = allStats.attempts.filter(attempt => {
      const isCorrect = attempt.is_correct === true;
      return isCorrect;
    });
    
    console.log('✅ Tentativas corretas encontradas:', correctAttempts.length);
    
    if (correctAttempts.length === 0) {
      console.log('⚠️ Nenhuma tentativa correta encontrada');
      return [];
    }
    
    const counts: Record<string, number> = {};
    correctAttempts.forEach(attempt => {
      const playerName = attempt.target_player_name;
      if (playerName && typeof playerName === 'string') {
        counts[playerName] = (counts[playerName] || 0) + 1;
      }
    });
    
    console.log('📈 Contagem final por jogador:', counts);
    
    const result = Object.entries(counts)
      .map(([name, count]) => ({ 
        player_name: name, 
        correct_count: count 
      }))
      .sort((a, b) => b.correct_count - a.correct_count)
      .slice(0, 10);
    
    console.log('🏆 Top jogadores mais acertados:', result);
    return result;
  }, [allStats?.attempts]);

  const mostMissedPlayers = useMemo((): MostMissedPlayer[] => {
    if (!allStats?.attempts || allStats.attempts.length === 0) {
      console.log('⚠️ Nenhuma tentativa para calcular jogadores mais difíceis');
      return [];
    }
    
    console.log('🎯 Calculando jogadores mais difíceis com', allStats.attempts.length, 'tentativas');
    
    const stats: Record<string, { total: number, missed: number }> = {};
    
    allStats.attempts.forEach(attempt => {
      const playerName = attempt.target_player_name;
      if (playerName && typeof playerName === 'string') {
        if (!stats[playerName]) {
          stats[playerName] = { total: 0, missed: 0 };
        }
        stats[playerName].total++;
        
        if (attempt.is_correct === false) {
          stats[playerName].missed++;
        }
      }
    });
    
    console.log('📊 Estatísticas de erro por jogador:', stats);
    
    const result = Object.entries(stats)
      .filter(([_, data]) => data.total >= 3)
      .map(([name, data]) => {
        const missRate = data.total > 0 ? (data.missed / data.total * 100).toFixed(1) : '0.0';
        return {
          player_name: name,
          missed_count: data.missed,
          total_attempts: data.total,
          miss_rate: missRate
        };
      })
      .sort((a, b) => b.missed_count - a.missed_count)
      .slice(0, 10);
    
    console.log('🎯 Top jogadores mais difíceis:', result);
    return result;
  }, [allStats?.attempts]);

  const progressStats = useMemo((): ProgressStat[] => {
    if (!allStats?.sessions || allStats.sessions.length === 0) {
      console.log('⚠️ Nenhuma sessão para calcular progresso');
      return [];
    }
    
    console.log('📈 Calculando estatísticas de progresso com', allStats.sessions.length, 'sessões');
    
    const stepCounts: Record<number, number> = allStats.sessions.reduce((acc, session) => {
      const step = session.total_correct || 0;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const result = Object.entries(stepCounts)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step);
    
    console.log('📈 Estatísticas de progresso:', result);
    return result;
  }, [allStats?.sessions]);

  const generalStats = useMemo((): GeneralStats | undefined => {
    if (!allStats) {
      console.log('⚠️ Nenhum dado para estatísticas gerais');
      return undefined;
    }
    
    console.log('📊 Calculando estatísticas gerais');
    
    const correctAttempts = allStats.attempts.filter(a => a.is_correct === true).length;
    const totalMatches = allStats.gameStarts?.length || 0;
    
    const result = {
      totalAttempts: totalMatches,
      totalSessions: allStats.sessions.length,
      totalPlayers: playersCount || 0,
      correctAttempts
    };
    
    console.log('📊 Estatísticas gerais calculadas:', result);
    return result;
  }, [allStats, playersCount]);

  const successRate = useMemo(() => {
    if (!allStats?.attempts || allStats.attempts.length === 0) {
      console.log('⚠️ Nenhuma tentativa para calcular taxa de sucesso');
      return '0';
    }
    
    const correctAttempts = allStats.attempts.filter(a => a.is_correct === true).length;
    const rate = ((correctAttempts / allStats.attempts.length) * 100).toFixed(1);
    
    console.log('📈 Taxa de sucesso calculada:', correctAttempts, '/', allStats.attempts.length, '=', rate + '%');
    return rate;
  }, [allStats?.attempts]);

  // Log final results for debugging
  console.log('🎯 Resultados finais do hook:', {
    mostCorrectPlayersCount: mostCorrectPlayers.length,
    mostMissedPlayersCount: mostMissedPlayers.length,
    playerRankingCount: allStats?.rankings?.length || 0,
    progressStatsCount: progressStats.length,
    generalStats,
    successRate,
    isLoading,
    hasError: !!error
  });

  return {
    mostCorrectPlayers,
    mostMissedPlayers,
    playerRanking: allStats?.rankings || [],
    progressStats,
    generalStats,
    successRate,
    isLoading
  };
};
