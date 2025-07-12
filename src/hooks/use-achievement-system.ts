import { useState, useCallback } from 'react';
import { checkAchievements } from '@/services/achievementsService';
import { useAnalytics } from '@/hooks/use-analytics';
import { ACHIEVEMENTS } from '@/types/achievements';

interface GameStats {
  score: number;
  streak: number;
  gamesPlayed: number;
  accuracy: number;
  timeToAnswer?: number;
}

export const useAchievementSystem = () => {
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([]);
  const { trackAchievementUnlocked } = useAnalytics();

  const checkAndUnlockAchievements = useCallback(async (
    userId: string | null,
    gameStats: GameStats
  ) => {
    if (!userId) return [];

    try {
      const unlockedIds = await checkAchievements(userId, gameStats);
      
      if (unlockedIds.length > 0) {
        setPendingAchievements(unlockedIds);
        
        // Track analytics for each achievement
        unlockedIds.forEach(id => {
          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          if (achievement) {
            trackAchievementUnlocked(achievement.name);
          }
        });
      }
      
      return unlockedIds;
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }, [trackAchievementUnlocked]);

  const clearPendingAchievements = useCallback(() => {
    setPendingAchievements([]);
  }, []);

  return {
    pendingAchievements,
    checkAndUnlockAchievements,
    clearPendingAchievements,
  };
};