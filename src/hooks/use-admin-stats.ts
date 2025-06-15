
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
  const { data: allStats, isLoading } = useQuery({
    queryKey: ['admin-stats-all'],
    queryFn: async (): Promise<AllStatsData> => {
      try {
        console.log('Fetching admin stats...');
        
        const [attemptsResult, sessionsResult, playersResult, rankingsResult, gameStartsResult] = await Promise.all([
          supabase.from('game_attempts').select('target_player_name, is_correct'),
          supabase.from('game_sessions').select('total_correct'),
          supabase.from('players').select('*', { count: 'exact', head: true }),
          supabase.from('rankings').select('*').order('score', { ascending: false }).limit(10),
          supabase.from('game_starts').select('*')
        ]);
        
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
        
        console.log('Stats fetched successfully:', {
          attempts: attemptsResult.data?.length || 0,
          sessions: sessionsResult.data?.length || 0,
          players: playersResult.count || 0,
          rankings: rankingsResult.data?.length || 0,
          gameStarts: gameStartsResult.data?.length || 0
        });
        
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
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
    if (!allStats?.attempts || allStats.attempts.length === 0) return [];
    
    const correctAttempts = allStats.attempts.filter(attempt => attempt.is_correct);
    const counts: Record<string, number> = correctAttempts.reduce((acc, attempt) => {
      acc[attempt.target_player_name] = (acc[attempt.target_player_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([name, count]) => ({ player_name: name, correct_count: count }))
      .sort((a, b) => b.correct_count - a.correct_count)
      .slice(0, 10);
  }, [allStats?.attempts]);

  const mostMissedPlayers = useMemo((): MostMissedPlayer[] => {
    if (!allStats?.attempts || allStats.attempts.length === 0) return [];
    
    const stats: Record<string, { total: number, missed: number }> = allStats.attempts.reduce((acc, attempt) => {
      if (!acc[attempt.target_player_name]) {
        acc[attempt.target_player_name] = { total: 0, missed: 0 };
      }
      acc[attempt.target_player_name].total++;
      if (!attempt.is_correct) {
        acc[attempt.target_player_name].missed++;
      }
      return acc;
    }, {} as Record<string, { total: number, missed: number }>);
    
    return Object.entries(stats)
      .filter(([_, data]) => data.total >= 3) // Only show players with at least 3 attempts
      .map(([name, data]) => ({
        player_name: name,
        missed_count: data.missed,
        total_attempts: data.total,
        miss_rate: (data.missed / data.total * 100).toFixed(1)
      }))
      .sort((a, b) => b.missed_count - a.missed_count)
      .slice(0, 10);
  }, [allStats?.attempts]);

  const progressStats = useMemo((): ProgressStat[] => {
    if (!allStats?.sessions || allStats.sessions.length === 0) return [];
    
    const stepCounts: Record<number, number> = allStats.sessions.reduce((acc, session) => {
      const step = session.total_correct || 0;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.entries(stepCounts)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step);
  }, [allStats?.sessions]);

  const generalStats = useMemo((): GeneralStats | undefined => {
    if (!allStats) return undefined;
    
    const correctAttempts = allStats.attempts.filter(a => a.is_correct).length;
    
    // Use game_starts data for total matches instead of attempts
    const totalMatches = allStats.gameStarts?.length || 0;
    
    return {
      totalAttempts: totalMatches, // Changed to use game_starts instead of attempts
      totalSessions: allStats.sessions.length,
      totalPlayers: playersCount || 0,
      correctAttempts
    };
  }, [allStats, playersCount]);

  const successRate = useMemo(() => {
    if (!allStats?.attempts || allStats.attempts.length === 0) return '0';
    const correctAttempts = allStats.attempts.filter(a => a.is_correct).length;
    return ((correctAttempts / allStats.attempts.length) * 100).toFixed(1);
  }, [allStats?.attempts]);

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
