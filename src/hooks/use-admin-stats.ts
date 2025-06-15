
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const useAdminStats = () => {
  // Jogadores mais acertados
  const { data: mostCorrectPlayers = [] } = useQuery({
    queryKey: ['most-correct-players'],
    queryFn: async (): Promise<PlayerStats[]> => {
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name')
        .eq('is_correct', true);
      
      if (error) throw error;
      
      const counts = data.reduce((acc: Record<string, number>, attempt) => {
        acc[attempt.target_player_name] = (acc[attempt.target_player_name] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(counts)
        .map(([name, count]) => ({ player_name: name, correct_count: count }))
        .sort((a, b) => b.correct_count - a.correct_count)
        .slice(0, 10);
    },
  });

  // Jogadores mais errados
  const { data: mostMissedPlayers = [] } = useQuery({
    queryKey: ['most-missed-players'],
    queryFn: async (): Promise<MostMissedPlayer[]> => {
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name, is_correct');
      
      if (error) throw error;
      
      const stats = data.reduce((acc: Record<string, { total: number, missed: number }>, attempt) => {
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
    },
  });

  // Ranking de jogadores
  const { data: playerRanking = [] } = useQuery({
    queryKey: ['player-ranking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Estatísticas de progresso
  const { data: progressStats = [] } = useQuery({
    queryKey: ['progress-stats'],
    queryFn: async (): Promise<ProgressStat[]> => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('total_correct');
      
      if (error) throw error;
      
      const stepCounts = data.reduce((acc: Record<number, number>, session) => {
        const step = session.total_correct;
        acc[step] = (acc[step] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(stepCounts)
        .map(([step, count]) => ({ step: parseInt(step), count }))
        .sort((a, b) => a.step - b.step);
    },
  });

  // Estatísticas gerais
  const { data: generalStats } = useQuery({
    queryKey: ['general-stats'],
    queryFn: async (): Promise<GeneralStats> => {
      const [attemptsResult, sessionsResult, playersResult] = await Promise.all([
        supabase.from('game_attempts').select('*', { count: 'exact' }),
        supabase.from('game_sessions').select('*', { count: 'exact' }),
        supabase.from('players').select('*', { count: 'exact' })
      ]);
      
      return {
        totalAttempts: attemptsResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        totalPlayers: playersResult.count || 0,
        correctAttempts: attemptsResult.data?.filter(a => a.is_correct).length || 0
      };
    },
  });

  const successRate = generalStats?.totalAttempts 
    ? ((generalStats.correctAttempts / generalStats.totalAttempts) * 100).toFixed(1)
    : '0';

  return {
    mostCorrectPlayers,
    mostMissedPlayers,
    playerRanking,
    progressStats,
    generalStats,
    successRate
  };
};
