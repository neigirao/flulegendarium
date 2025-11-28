import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'special';
  target_value: number;
  target_metric: 'accuracy' | 'speed' | 'streak' | 'games_played';
  reward_points: number;
  start_date: string;
  end_date: string;
  current_progress?: number;
  is_completed?: boolean;
}

export const useDailyChallenges = () => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        
        // Fetch active challenges
        const { data: challengesData, error: challengesError } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString().split('T')[0]);
          
        if (challengesError) throw challengesError;

        let challengesWithProgress = challengesData;

        // If user is logged in, fetch their progress
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_challenge_progress')
            .select('challenge_id, current_progress, is_completed')
            .eq('user_id', user.id);
            
          if (progressError) throw progressError;

          const progressMap = progressData.reduce((acc, progress) => {
            acc[progress.challenge_id] = progress;
            return acc;
          }, {} as Record<string, any>);

          challengesWithProgress = challengesData.map(challenge => ({
            ...challenge,
            current_progress: progressMap[challenge.id]?.current_progress || 0,
            is_completed: progressMap[challenge.id]?.is_completed || false,
          }));
        }

        setChallenges(challengesWithProgress as DailyChallenge[]);
      } catch (error) {
        logger.error('Erro ao buscar desafios', 'DAILY_CHALLENGES', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_challenges'
        },
        () => {
          fetchChallenges();
        }
      );

    if (user) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_challenge_progress',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchChallenges();
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateProgress = async (challengeId: string, progress: number) => {
    if (!user) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const isCompleted = progress >= challenge.target_value;

      const { error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: progress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Erro ao atualizar progresso do desafio', 'DAILY_CHALLENGES', error);
    }
  };

  return {
    challenges,
    isLoading,
    updateProgress
  };
};