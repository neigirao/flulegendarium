
import { supabase } from "@/integrations/supabase/client";
import { UserAchievement, ACHIEVEMENTS } from "@/types/achievements";

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }

  return data || [];
};

export const unlockAchievement = async (userId: string, achievementId: string): Promise<UserAchievement> => {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) {
    throw new Error(`Achievement ${achievementId} not found`);
  }

  // Check if user already has this achievement
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .insert([{
      user_id: userId,
      achievement_id: achievementId,
      progress: achievement.condition.value,
      max_progress: achievement.condition.value
    }])
    .select()
    .single();

  if (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }

  return data;
};

export const checkAchievements = async (userId: string, gameStats: {
  score: number;
  streak: number;
  gamesPlayed: number;
  accuracy: number;
  timeToAnswer?: number;
}): Promise<string[]> => {
  const unlockedAchievements: string[] = [];
  
  // Get user's current achievements
  const userAchievements = await getUserAchievements(userId);
  const unlockedIds = userAchievements.map(ua => ua.achievement_id);

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.condition.type) {
      case 'score':
        shouldUnlock = checkCondition(gameStats.score, achievement.condition.value, achievement.condition.operator);
        break;
      case 'streak':
        shouldUnlock = checkCondition(gameStats.streak, achievement.condition.value, achievement.condition.operator);
        break;
      case 'games_played':
        shouldUnlock = checkCondition(gameStats.gamesPlayed, achievement.condition.value, achievement.condition.operator);
        break;
      case 'accuracy':
        shouldUnlock = checkCondition(gameStats.accuracy, achievement.condition.value, achievement.condition.operator);
        break;
      case 'time':
        if (gameStats.timeToAnswer !== undefined) {
          shouldUnlock = checkCondition(gameStats.timeToAnswer, achievement.condition.value, achievement.condition.operator);
        }
        break;
    }

    if (shouldUnlock) {
      try {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement.id);
      } catch (error) {
        console.error(`Failed to unlock achievement ${achievement.id}:`, error);
      }
    }
  }

  return unlockedAchievements;
};

const checkCondition = (value: number, target: number, operator: 'gte' | 'lte' | 'eq'): boolean => {
  switch (operator) {
    case 'gte': return value >= target;
    case 'lte': return value <= target;
    case 'eq': return value === target;
    default: return false;
  }
};
