import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfWeek, subWeeks, format } from 'date-fns';

interface UserStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalCorrectGuesses: number;
  averageAccuracy: number;
  maxStreak: number;
  totalPlayTime: number;
}

interface WeeklyRankingEntry {
  week: string;
  weekStart: Date;
  score: number;
  rank: number | null;
  gamesPlayed: number;
}

interface Challenge {
  id: string;
  challenger_id: string | null;
  challenger_name: string;
  challenged_id: string | null;
  challenged_name: string | null;
  challenger_score: number;
  challenged_score: number | null;
  game_mode: string;
  difficulty_level: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  // Fetch user game statistics
  const statsQuery = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_game_history')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
          totalCorrectGuesses: 0,
          averageAccuracy: 0,
          maxStreak: 0,
          totalPlayTime: 0,
        };
      }

      const totalGames = data.length;
      const totalScore = data.reduce((sum, g) => sum + g.score, 0);
      const bestScore = Math.max(...data.map(g => g.score));
      const totalCorrectGuesses = data.reduce((sum, g) => sum + g.correct_guesses, 0);
      const totalAttempts = data.reduce((sum, g) => sum + g.total_attempts, 0);
      const maxStreak = Math.max(...data.map(g => g.max_streak || 0));
      const totalPlayTime = data.reduce((sum, g) => sum + (g.game_duration || 0), 0);

      return {
        totalGames,
        totalScore,
        averageScore: Math.round(totalScore / totalGames),
        bestScore,
        totalCorrectGuesses,
        averageAccuracy: totalAttempts > 0 ? Math.round((totalCorrectGuesses / totalAttempts) * 100) : 0,
        maxStreak,
        totalPlayTime,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch weekly ranking evolution (last 8 weeks)
  const weeklyRankingQuery = useQuery({
    queryKey: ['weekly-ranking-evolution', user?.id],
    queryFn: async (): Promise<WeeklyRankingEntry[]> => {
      if (!user?.id) throw new Error('No user');

      const weeks: WeeklyRankingEntry[] = [];
      const now = new Date();

      for (let i = 0; i < 8; i++) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Get user's best score for this week
        const { data: userRankings } = await supabase
          .from('rankings')
          .select('score')
          .eq('user_id', user.id)
          .gte('created_at', weekStart.toISOString())
          .lt('created_at', weekEnd.toISOString())
          .order('score', { ascending: false });

        const gamesPlayed = userRankings?.length || 0;
        const bestScore = userRankings?.[0]?.score || 0;

        // Get rank for this week (only if user has a score)
        let rank = null;
        if (bestScore > 0) {
          const { count } = await supabase
            .from('rankings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekStart.toISOString())
            .lt('created_at', weekEnd.toISOString())
            .gt('score', bestScore);

          rank = (count || 0) + 1;
        }

        weeks.push({
          week: format(weekStart, 'dd/MM'),
          weekStart,
          score: bestScore,
          rank,
          gamesPlayed,
        });
      }

      return weeks.reverse(); // Oldest first
    },
    enabled: !!user?.id,
  });

  // Fetch challenges (sent and received)
  const challengesQuery = useQuery({
    queryKey: ['user-challenges', user?.id],
    queryFn: async (): Promise<{ sent: Challenge[]; received: Challenge[] }> => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const sent = (data || []).filter(c => c.challenger_id === user.id) as Challenge[];
      const received = (data || []).filter(c => c.challenged_id === user.id) as Challenge[];

      return { sent, received };
    },
    enabled: !!user?.id,
  });

  return {
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    weeklyRanking: weeklyRankingQuery.data,
    weeklyRankingLoading: weeklyRankingQuery.isLoading,
    challenges: challengesQuery.data,
    challengesLoading: challengesQuery.isLoading,
    isLoading: statsQuery.isLoading || weeklyRankingQuery.isLoading || challengesQuery.isLoading,
  };
};
