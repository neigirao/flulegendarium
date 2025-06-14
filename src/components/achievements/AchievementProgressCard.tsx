
import { Achievement, UserAchievement } from "@/types/achievements";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Star, Lock } from "lucide-react";

interface AchievementProgressCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  progress: number;
  showProgress?: boolean;
}

export const AchievementProgressCard = ({ 
  achievement, 
  userAchievement,
  progress,
  showProgress = true 
}: AchievementProgressCardProps) => {
  const isUnlocked = !!userAchievement;
  const progressPercentage = isUnlocked ? 100 : (progress / achievement.condition.value) * 100;
  const isNearCompletion = progressPercentage >= 80 && !isUnlocked;
  const isHidden = achievement.hidden && !isUnlocked;

  const getRarityConfig = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': 
        return {
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          badgeColor: 'bg-gray-500',
          iconColor: 'text-gray-600'
        };
      case 'rare': 
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          badgeColor: 'bg-blue-500',
          iconColor: 'text-blue-600'
        };
      case 'epic': 
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-300',
          badgeColor: 'bg-purple-500',
          iconColor: 'text-purple-600'
        };
      case 'legendary': 
        return {
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-400',
          badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          iconColor: 'text-yellow-600'
        };
    }
  };

  const rarityConfig = getRarityConfig(achievement.rarity);

  if (isHidden) {
    return (
      <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-50">
        <div className="flex items-center justify-center h-20 text-gray-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-500">Conquista Secreta</p>
          <p className="text-xs text-gray-400">Continue jogando para descobrir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative p-4 rounded-lg border-2 transition-all duration-300 group",
      rarityConfig.bgColor,
      rarityConfig.borderColor,
      isUnlocked 
        ? "shadow-md hover:shadow-lg transform hover:scale-105" 
        : "opacity-75 hover:opacity-90",
      isNearCompletion && "animate-pulse ring-2 ring-flu-verde/50"
    )}>
      {/* Efeito de brilho para lendárias */}
      {achievement.rarity === 'legendary' && isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent 
                        animate-shimmer rounded-lg pointer-events-none" />
      )}

      {/* Header com ícone e raridade */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex flex-col items-end gap-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs text-white border-none",
              rarityConfig.badgeColor
            )}
          >
            {achievement.rarity}
          </Badge>
          {achievement.points > 0 && (
            <div className="flex items-center gap-1 text-xs text-flu-grena">
              <Star className="w-3 h-3" />
              <span>{achievement.points}pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-2">
        <h4 className={cn(
          "font-semibold text-sm",
          isUnlocked ? "text-gray-900" : "text-gray-600"
        )}>
          {achievement.name}
        </h4>
        
        <p className={cn(
          "text-xs leading-relaxed",
          isUnlocked ? "text-gray-700" : "text-gray-500"
        )}>
          {achievement.description}
        </p>

        {/* Barra de progresso */}
        {showProgress && !isUnlocked && (
          <div className="space-y-1">
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress}/{achievement.condition.value}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        )}

        {/* Selo de desbloqueado */}
        {isUnlocked && (
          <div className="flex items-center justify-center mt-3 p-2 bg-green-100 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-xs font-medium">Desbloqueada!</span>
            </div>
          </div>
        )}

        {/* Próximo nível */}
        {!isUnlocked && isNearCompletion && (
          <div className="bg-flu-verde/10 border border-flu-verde/20 rounded p-2 mt-2">
            <p className="text-xs text-flu-verde font-medium text-center">
              🔥 Quase lá! Faltam apenas {achievement.condition.value - progress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
