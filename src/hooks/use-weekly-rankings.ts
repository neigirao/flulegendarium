import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyRanking {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

export const useWeeklyRankings = (limit: number = 10) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  return useQuery({
    queryKey: ['weekly-rankings', weekStart.toISOString()],
    queryFn: async (): Promise<WeeklyRanking[]> => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

export const getWeekDates = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  return { weekStart, weekEnd };
};
