import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const challengeDay = (date = new Date()) => date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
export const nextChallengeProgress = (metric: string, current: number, value: number) =>
  ['streak', 'max_streak', 'accuracy', 'score_threshold'].includes(metric)
    ? Math.max(current, value) : current + value;

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_metric: string;
  target_value: number;
  reward_points: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean | null;
}

interface UserChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string | null;
  current_progress: number | null;
  is_completed: boolean | null;
  completed_at: string | null;
}

interface ChallengeWithProgress extends DailyChallenge {
  progress: UserChallengeProgress | null;
}

export const useDailyChallengesModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active daily challenges with user progress
  const challengesQuery = useQuery({
    queryKey: ['daily-challenges-with-progress', user?.id],
    queryFn: async (): Promise<ChallengeWithProgress[]> => {
      const today = challengeDay();

      // Get active challenges
      const { data: challenges, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today);

      if (challengesError) throw challengesError;
      if (!challenges || challenges.length === 0) return [];

      // Get user progress if logged in
      let progressMap: Record<string, UserChallengeProgress> = {};
      
      if (user?.id) {
        const challengeIds = challenges.map(c => c.id);
        const { data: progress } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('challenge_id', challengeIds);

        if (progress) {
          progressMap = progress.reduce((acc, p) => {
            acc[p.challenge_id] = p;
            return acc;
          }, {} as Record<string, UserChallengeProgress>);
        }
      }

      return challenges.map(challenge => ({
        ...challenge,
        // No reward ledger exists yet. Never announce an uncredited bonus.
        reward_points: 0,
        progress: progressMap[challenge.id] || null,
      }));
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Update challenge progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      challengeId, 
      increment = 1,
      metric 
    }: { 
      challengeId: string; 
      increment?: number;
      metric: string;
    }) => {
      if (!user?.id) {
        logger.debug('Cannot update challenge progress - no user', 'DAILY_CHALLENGES');
        return null;
      }

      // Get current progress
      const { data: existing, error: existingError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingError) throw existingError;

      // Get challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;
      if (!challenge || !challenge.is_active || challenge.start_date > challengeDay() || challenge.end_date < challengeDay() || challenge.target_metric !== metric || existing?.is_completed) return null;

      const currentProgress = existing?.current_progress || 0;
      const newProgress = nextChallengeProgress(metric, currentProgress, increment);
      const isCompleted = newProgress >= challenge.target_value;

      if (existing) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_challenge_progress')
          .update({
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted && !existing.is_completed ? new Date().toISOString() : existing.completed_at,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { progress: data, challenge, justCompleted: isCompleted && !existing.is_completed };
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('user_challenge_progress')
          .insert({
            challenge_id: challengeId,
            user_id: user.id,
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        return { progress: data, challenge, justCompleted: isCompleted };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges-with-progress'] });
      
      if (result?.justCompleted) {
        toast({
          title: "🎉 Desafio Concluído!",
          description: `Você completou "${result.challenge.title}"!`,
        });
      }
    },
    onError: (error) => {
      logger.error('Error updating challenge progress', 'DAILY_CHALLENGES', error);
    },
  });

  // Helper to update progress for a specific metric
  const updateProgressForMetric = async (metric: string, increment: number = 1) => {
    if (!user?.id) return;

    const challenges = challengesQuery.data || [];
    const relevantChallenges = challenges.filter(
      c => (c.target_metric === metric || (metric === 'max_streak' && c.target_metric === 'streak')) && !c.progress?.is_completed
    );

    for (const challenge of relevantChallenges) {
      await updateProgressMutation.mutateAsync({
        challengeId: challenge.id,
        increment,
        metric: challenge.target_metric,
      });
    }
  };

  return {
    challenges: challengesQuery.data || [],
    isLoading: challengesQuery.isLoading,
    error: challengesQuery.error,
    updateProgress: updateProgressMutation.mutate,
    updateProgressForMetric,
    refetch: challengesQuery.refetch,
  };
};
