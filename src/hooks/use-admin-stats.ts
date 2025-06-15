
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
}

export const useAdminStats = () => {
  // Single optimized query to fetch all data at once
  const { data: allStats, isLoading } = useQuery({
    queryKey: ['admin-stats-all'],
    queryFn: async (): Promise<AllStatsData> => {
      const [attemptsResult, sessionsResult, playersResult, rankingsResult] = await Promise.all([
        supabase.from('game_attempts').select('target_player_name, is_correct'),
        supabase.from('game_sessions').select('total_correct'),
        supabase.from('players').select('*', { count: 'exact', head: true }),
        supabase.from('rankings').select('*').order('score', { ascending: false }).limit(10)
      ]);
      
      if (attemptsResult.error) throw attemptsResult.error;
      if (sessionsResult.error) throw sessionsResult.error;
      if (playersResult.error) throw playersResult.error;
      if (rankingsResult.error) throw rankingsResult.error;
      
      return {
        attempts: attemptsResult.data || [],
        sessions: sessionsResult.data || [],
        players: playersResult.data || [],
        rankings: rankingsResult.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoized calculations to prevent re-computation
  const mostCorrectPlayers = useMemo((): PlayerStats[] => {
    if (!allStats?.attempts) return [];
    
    const correctAttempts = allStats.attempts.filter(attempt => attempt.is_correct);
    const counts = correctAttempts.reduce((acc: Record<string, number>, attempt) => {
      acc[attempt.target_player_name] = (acc[attempt.target_player_name] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([name, count]) => ({ player_name: name, correct_count: count }))
      .sort((a, b) => b.correct_count - a.correct_count)
      .slice(0, 10);
  }, [allStats?.attempts]);

  const mostMissedPlayers = useMemo((): MostMissedPlayer[] => {
    if (!allStats?.attempts) return [];
    
    const stats = allStats.attempts.reduce((acc: Record<string, { total: number, missed: number }>, attempt) => {
      if (!acc[attempt.target_player_name]) {
        acc[attempt.target_player_name] = { total: 0, missed: 0 };
      }
      acc[attempt.target_player_name].total++;
      if (!attempt.is_correct) {
        acc[attempt.target_player_name].missed++;
      }
      return acc;
    }, {});
    
    return Object.entries(stats)
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
    if (!allStats?.sessions) return [];
    
    const stepCounts = allStats.sessions.reduce((acc: Record<number, number>, session) => {
      const step = session.total_correct;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(stepCounts)
      .map(([step, count]) => ({ step: parseInt(step), count }))
      .sort((a, b) => a.step - b.step);
  }, [allStats?.sessions]);

  const generalStats = useMemo((): GeneralStats | undefined => {
    if (!allStats) return undefined;
    
    const correctAttempts = allStats.attempts.filter(a => a.is_correct).length;
    
    return {
      totalAttempts: allStats.attempts.length,
      totalSessions: allStats.sessions.length,
      totalPlayers: allStats.players.length,
      correctAttempts
    };
  }, [allStats]);

  const successRate = useMemo(() => {
    if (!generalStats?.totalAttempts) return '0';
    return ((generalStats.correctAttempts / generalStats.totalAttempts) * 100).toFixed(1);
  }, [generalStats]);

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
