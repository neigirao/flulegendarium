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
        console.log('📊 Fetching admin stats...');
        
        const [attemptsResult, sessionsResult, playersResult, rankingsResult, gameStartsResult] = await Promise.all([
          supabase.from('game_attempts').select('*'),
          supabase.from('game_sessions').select('*'),
          supabase.from('players').select('*', { count: 'exact', head: true }),
          supabase.from('rankings').select('*').order('score', { ascending: false }),
          supabase.from('game_starts').select('*')
        ]);
        
        // Log results for debugging
        console.log('Attempts data:', attemptsResult.data?.length || 0);
        console.log('Sessions data:', sessionsResult.data?.length || 0);
        console.log('Players count:', playersResult.count);
        console.log('Rankings data:', rankingsResult.data?.length || 0);
        console.log('Game starts data:', gameStartsResult.data?.length || 0);
        
        // Log any errors but don't throw to prevent the entire stats from failing
        if (attemptsResult.error) {
          console.error('Error fetching attempts:', attemptsResult.error);
        }
        if (sessionsResult.error) {
          console.error('Error fetching sessions:', sessionsResult.error);
        }
        if (playersResult.error) {
          console.error('Error fetching players:', playersResult.error);
        }
        if (rankingsResult.error) {
          console.error('Error fetching rankings:', rankingsResult.error);
        }
        if (gameStartsResult.error) {
          console.error('Error fetching game starts:', gameStartsResult.error);
        }
        
        return {
          attempts: attemptsResult.data || [],
          sessions: sessionsResult.data || [],
          players: [],
          rankings: rankingsResult.data || [],
          gameStarts: gameStartsResult.data || []
        };
      } catch (error) {
        console.error('Error in admin stats query:', error);
        return {
          attempts: [],
          sessions: [],
          players: [],
          rankings: [],
          gameStarts: []
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - mais frequente para dados do admin
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchInterval: 3 * 60 * 1000, // Refetch a cada 3 minutos
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
          console.error('Error fetching players count:', error);
          return 0;
        }
        
        console.log('Players count result:', count);
        return count || 0;
      } catch (error) {
        console.error('Error in players count query:', error);
        return 0;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1
  });

  // Memoized calculations to prevent re-computation
  const mostCorrectPlayers = useMemo((): PlayerStats[] => {
    if (!allStats?.attempts || allStats.attempts.length === 0) {
      console.log('No attempts data for mostCorrectPlayers');
      return [];
    }
    
    console.log('Calculating mostCorrectPlayers with', allStats.attempts.length, 'attempts');
    
    const correctAttempts = allStats.attempts.filter(attempt => attempt.is_correct === true);
    console.log('Correct attempts:', correctAttempts.length);
    
    const counts: Record<string, number> = correctAttempts.reduce((acc, attempt) => {
      const playerName = attempt.target_player_name;
      if (playerName) {
        acc[playerName] = (acc[playerName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Player correct counts:', counts);
    
    const result = Object.entries(counts)
      .map(([name, count]) => ({ player_name: name, correct_count: count }))
      .sort((a, b) => b.correct_count - a.correct_count)
      .slice(0, 10);
    
    console.log('Most correct players result:', result);
    return result;
  }, [allStats?.attempts]);

  const mostMissedPlayers = useMemo((): MostMissedPlayer[] => {
    if (!allStats?.attempts || allStats.attempts.length === 0) {
      console.log('No attempts data for mostMissedPlayers');
      return [];
    }
    
    console.log('Calculating mostMissedPlayers with', allStats.attempts.length, 'attempts');
    
    const stats: Record<string, { total: number, missed: number }> = allStats.attempts.reduce((acc, attempt) => {
      const playerName = attempt.target_player_name;
      if (playerName) {
        if (!acc[playerName]) {
          acc[playerName] = { total: 0, missed: 0 };
        }
        acc[playerName].total++;
        if (attempt.is_correct === false) {
          acc[playerName].missed++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number, missed: number }>);
    
    console.log('Player miss stats:', stats);
    
    const result = Object.entries(stats)
      .filter(([_, data]) => data.total >= 3) // Only show players with at least 3 attempts
      .map(([name, data]) => ({
        player_name: name,
        missed_count: data.missed,
        total_attempts: data.total,
        miss_rate: (data.missed / data.total * 100).toFixed(1)
      }))
      .sort((a, b) => b.missed_count - a.missed_count)
      .slice(0, 10);
    
    console.log('Most missed players result:', result);
    return result;
  }, [allStats?.attempts]);

  const progressStats = useMemo((): ProgressStat[] => {
    if (!allStats?.sessions || allStats.sessions.length === 0) {
      console.log('No sessions data for progressStats');
      return [];
    }
    
    console.log('Calculating progressStats with', allStats.sessions.length, 'sessions');
    
    const stepCounts: Record<number, number> = allStats.sessions.reduce((acc, session) => {
      const step = session.total_correct || 0;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const result = Object.entries(stepCounts)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step);
    
    console.log('Progress stats result:', result);
    return result;
  }, [allStats?.sessions]);

  const generalStats = useMemo((): GeneralStats | undefined => {
    if (!allStats) {
      console.log('No allStats data for generalStats');
      return undefined;
    }
    
    console.log('Calculating generalStats');
    
    const correctAttempts = allStats.attempts.filter(a => a.is_correct === true).length;
    const totalMatches = allStats.gameStarts?.length || 0;
    
    const result = {
      totalAttempts: totalMatches,
      totalSessions: allStats.sessions.length,
      totalPlayers: playersCount || 0,
      correctAttempts
    };
    
    console.log('General stats result:', result);
    return result;
  }, [allStats, playersCount]);

  const successRate = useMemo(() => {
    if (!allStats?.attempts || allStats.attempts.length === 0) {
      console.log('No attempts data for successRate');
      return '0';
    }
    
    const correctAttempts = allStats.attempts.filter(a => a.is_correct === true).length;
    const rate = ((correctAttempts / allStats.attempts.length) * 100).toFixed(1);
    
    console.log('Success rate calculation:', correctAttempts, '/', allStats.attempts.length, '=', rate + '%');
    return rate;
  }, [allStats?.attempts]);

  // Log final results for debugging
  console.log('Final hook results:', {
    mostCorrectPlayers,
    mostMissedPlayers,
    playerRanking: allStats?.rankings || [],
    progressStats,
    generalStats,
    successRate,
    isLoading,
    error
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
