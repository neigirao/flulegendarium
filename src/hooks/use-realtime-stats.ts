import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveStats {
  online_users: number;
  games_played_today: number;
  total_players_discovered: number;
}

export const useRealtimeStats = () => {
  const [stats, setStats] = useState<LiveStats>({
    online_users: 0,
    games_played_today: 0,
    total_players_discovered: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial stats
    const fetchInitialStats = async () => {
      try {
        const { data, error } = await supabase
          .from('live_stats')
          .select('stat_key, stat_value');
        
        if (error) throw error;
        
        const statsMap = data.reduce((acc, stat) => {
          acc[stat.stat_key as keyof LiveStats] = stat.stat_value;
          return acc;
        }, {} as Partial<LiveStats>);
        
        setStats(prev => ({ ...prev, ...statsMap }));
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_stats'
        },
        (payload) => {
          const { stat_key, stat_value } = payload.new as { stat_key: keyof LiveStats; stat_value: number };
          setStats(prev => ({
            ...prev,
            [stat_key]: stat_value
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const incrementStat = async (statKey: keyof LiveStats, increment = 1) => {
    try {
      // Update local state optimistically
      setStats(prev => ({
        ...prev,
        [statKey]: prev[statKey] + increment
      }));

      // Update in database
      const { error } = await supabase
        .from('live_stats')
        .update({ 
          stat_value: stats[statKey] + increment,
          updated_at: new Date().toISOString()
        })
        .eq('stat_key', statKey);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao incrementar ${statKey}:`, error);
    }
  };

  return {
    stats,
    isLoading,
    incrementStat
  };
};