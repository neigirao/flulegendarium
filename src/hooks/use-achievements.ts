
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { checkAchievements } from "@/services/achievementsService";
import { ACHIEVEMENTS } from "@/types/achievements";
import { useToast } from "@/components/ui/use-toast";

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const checkAndUnlockAchievements = useCallback(async (gameStats: {
    score: number;
    streak: number;
    gamesPlayed: number;
    accuracy: number;
    timeToAnswer?: number;
  }) => {
    if (!user) return [];

    setIsChecking(true);
    try {
      const newAchievements = await checkAchievements(user.id, gameStats);
      
      // Show toast notifications for new achievements
      newAchievements.forEach(achievementId => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) {
          toast({
            title: "🎉 Nova Conquista!",
            description: `Você desbloqueou: ${achievement.name} ${achievement.icon}`,
            duration: 5000,
          });
        }
      });

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    } finally {
      setIsChecking(false);
    }
  }, [user, toast]);

  return {
    checkAndUnlockAchievements,
    isChecking
  };
};
