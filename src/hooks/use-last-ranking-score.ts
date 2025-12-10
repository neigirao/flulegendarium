import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LastRankingScore {
  score: number;
  gameMode: 'adaptive' | 'decade';
  difficulty?: string;
  createdAt: string;
}

export const useLastRankingScore = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['last-ranking-score', user?.id],
    queryFn: async (): Promise<LastRankingScore | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('rankings')
        .select('score, game_mode, difficulty_level, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        score: data.score,
        gameMode: data.game_mode === 'decade' ? 'decade' : 'adaptive',
        difficulty: data.difficulty_level || undefined,
        createdAt: data.created_at,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
