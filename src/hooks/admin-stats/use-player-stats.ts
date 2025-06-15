
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
  const { data: playerStatsData, isLoading } = useQuery({
    queryKey: ['admin-player-stats'],
    queryFn: async () => {
      try {
        console.log('📊 Buscando estatísticas de jogadores otimizadas...');
        
        // Query otimizada usando aggregate functions
        const { data: mostCorrectData, error: correctError } = await supabase
          .from('game_attempts')
          .select('target_player_name, is_correct')
          .eq('is_correct', true);
        
        const { data: allAttemptsData, error: attemptsError } = await supabase
          .from('game_attempts')
          .select('target_player_name, is_correct');

        if (correctError || attemptsError) {
          console.error('❌ Erro ao buscar dados dos jogadores:', correctError || attemptsError);
          return { mostCorrectData: [], allAttemptsData: [], successRate: '0' };
        }

        // Calcular taxa de sucesso
        const totalAttempts = allAttemptsData?.length || 0;
        const correctAttempts = mostCorrectData?.length || 0;
        const successRate = totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(1) : '0';

        return {
          mostCorrectData: mostCorrectData || [],
          allAttemptsData: allAttemptsData || [],
          successRate
        };
      } catch (error) {
        console.error('❌ Erro nas estatísticas de jogadores:', error);
        return { mostCorrectData: [], allAttemptsData: [], successRate: '0' };
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutos de cache
    gcTime: 6 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const mostCorrectPlayers = useMemo((): PlayerStats[] => {
    if (!playerStatsData?.mostCorrectData?.length) return [];
    
    const counts: Record<string, number> = {};
    playerStatsData.mostCorrectData.forEach(attempt => {
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
  }, [playerStatsData?.mostCorrectData]);

  const mostMissedPlayers = useMemo((): MostMissedPlayer[] => {
    if (!playerStatsData?.allAttemptsData?.length) return [];
    
    const stats: Record<string, { total: number, missed: number }> = {};
    
    playerStatsData.allAttemptsData.forEach(attempt => {
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
      .filter(([_, data]) => data.total >= 5) // Aumentei para 5 para ter mais dados significativos
      .map(([name, data]) => {
        const missRate = data.total > 0 ? (data.missed / data.total * 100).toFixed(1) : '0.0';
        return {
          player_name: name,
          missed_count: data.missed,
          total_attempts: data.total,
          miss_rate: missRate
        };
      })
      .sort((a, b) => parseFloat(b.miss_rate) - parseFloat(a.miss_rate))
      .slice(0, 10);
  }, [playerStatsData?.allAttemptsData]);

  return {
    mostCorrectPlayers,
    mostMissedPlayers,
    successRate: playerStatsData?.successRate || '0',
    isLoading
  };
};
