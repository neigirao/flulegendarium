import { useContext } from 'react';
import { AchievementContext } from '@/components/achievements/AchievementSystemProvider';

export const useAchievementSystem = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievementSystem must be used within an AchievementSystemProvider');
  }
  return context;
};
