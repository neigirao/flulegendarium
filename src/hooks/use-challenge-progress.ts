import { useCallback } from 'react';
import { useDailyChallengesModule } from './use-daily-challenges-module';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

/**
 * Hook to integrate daily challenges with gameplay
 * Provides simple functions to update challenge progress during game
 */
export const useChallengeProgress = () => {
  const { user } = useAuth();
  const { updateProgressForMetric, challenges } = useDailyChallengesModule();

  /**
   * Called when player makes a correct guess
   */
  const onCorrectGuess = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await updateProgressForMetric('correct_guesses', 1);
    } catch (error) {
      logger.error('Failed to update challenge progress for correct guess', 'CHALLENGES', error);
    }
  }, [user?.id, updateProgressForMetric]);

  /**
   * Called when player achieves a streak
   */
  const onStreakAchieved = useCallback(async (streak: number) => {
    if (!user?.id) return;
    
    try {
      // Update max streak challenges
      await updateProgressForMetric('max_streak', streak);
    } catch (error) {
      logger.error('Failed to update challenge progress for streak', 'CHALLENGES', error);
    }
  }, [user?.id, updateProgressForMetric]);

  /**
   * Called when a game is completed
   */
  const onGameCompleted = useCallback(async (score: number) => {
    if (!user?.id) return;
    
    try {
      // Update games played challenges
      await updateProgressForMetric('games_played', 1);
      
      // Update score challenges
      await updateProgressForMetric('total_score', score);
    } catch (error) {
      logger.error('Failed to update challenge progress for game completion', 'CHALLENGES', error);
    }
  }, [user?.id, updateProgressForMetric]);

  /**
   * Called when player achieves a certain score threshold
   */
  const onScoreThreshold = useCallback(async (score: number) => {
    if (!user?.id) return;
    
    try {
      // For threshold-based challenges (e.g., "score 100+ points in a single game")
      await updateProgressForMetric('score_threshold', score);
    } catch (error) {
      logger.error('Failed to update challenge progress for score threshold', 'CHALLENGES', error);
    }
  }, [user?.id, updateProgressForMetric]);

  return {
    onCorrectGuess,
    onStreakAchieved,
    onGameCompleted,
    onScoreThreshold,
    hasActiveChallenges: challenges.length > 0,
  };
};
