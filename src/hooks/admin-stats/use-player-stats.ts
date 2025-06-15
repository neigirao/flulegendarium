
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

export const usePlayerStats = () => {
  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['admin-player-attempts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('game_attempts').select('*');
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('❌ Erro ao buscar tentativas:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1
  });

  const mostCorrectPlayers = useMemo((): PlayerStats[] => {
    if (!attempts || attempts.length === 0) {
      return [];
    }
    
    const correctAttempts = attempts.filter(attempt => attempt.is_correct === true);
    const counts: Record<string, number> = {};
    
    correctAttempts.forEach(attempt => {
      const playerName = attempt.target_player_name;
      if (playerName && typeof playerName === 'string') {
        counts[playerName] = (counts[playerName] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ 
        player_name: name, 
        correct_count: count 
      }))
      .sort((a, b) => b.correct_count - a.correct_count)
      .slice(0, 10);
  }, [attempts]);

  const mostMissedPlayers = useMemo((): MostMissedPlayer[] => {
    if (!attempts || attempts.length === 0) {
      return [];
    }
    
    const stats: Record<string, { total: number, missed: number }> = {};
    
    attempts.forEach(attempt => {
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
    
    return Object.entries(stats)
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
  }, [attempts]);

  const successRate = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return '0';
    }
    
    const correctAttempts = attempts.filter(a => a.is_correct === true).length;
    return ((correctAttempts / attempts.length) * 100).toFixed(1);
  }, [attempts]);

  return {
    mostCorrectPlayers,
    mostMissedPlayers,
    successRate,
    isLoading
  };
};
