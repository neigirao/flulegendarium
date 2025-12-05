
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
          bgColor: 'bg-muted',
          borderColor: 'border-neutral-300',
          badgeColor: 'bg-neutral-500',
          iconColor: 'text-muted-foreground'
        };
      case 'rare': 
        return {
          bgColor: 'bg-info-light',
          borderColor: 'border-info/50',
          badgeColor: 'bg-info',
          iconColor: 'text-info'
        };
      case 'epic': 
        return {
          bgColor: 'bg-accent/10',
          borderColor: 'border-accent/50',
          badgeColor: 'bg-accent',
          iconColor: 'text-accent'
        };
      case 'legendary': 
        return {
          bgColor: 'bg-gradient-to-br from-warning-light to-warning/20',
          borderColor: 'border-warning',
          badgeColor: 'bg-gradient-to-r from-warning to-warning/80',
          iconColor: 'text-warning'
        };
    }
  };

  const rarityConfig = getRarityConfig(achievement.rarity);

  if (isHidden) {
    return (
      <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/50 opacity-50">
        <div className="flex items-center justify-center h-20 text-muted-foreground">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">Conquista Secreta</p>
          <p className="text-xs text-muted-foreground/70">Continue jogando para descobrir...</p>
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
      isNearCompletion && "animate-pulse ring-2 ring-secondary/50"
    )}>
      {/* Efeito de brilho para lendárias */}
      {achievement.rarity === 'legendary' && isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/20 to-transparent 
                        animate-shimmer rounded-lg pointer-events-none" />
      )}

      {/* Header com ícone e raridade */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex flex-col items-end gap-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs text-primary-foreground border-none",
              rarityConfig.badgeColor
            )}
          >
            {achievement.rarity}
          </Badge>
          {achievement.points > 0 && (
            <div className="flex items-center gap-1 text-xs text-primary">
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
          isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {achievement.name}
        </h4>
        
        <p className={cn(
          "text-xs leading-relaxed",
          isUnlocked ? "text-foreground/80" : "text-muted-foreground"
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress}/{achievement.condition.value}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        )}

        {/* Selo de desbloqueado */}
        {isUnlocked && (
          <div className="flex items-center justify-center mt-3 p-2 bg-success-light rounded-md">
            <div className="flex items-center gap-2 text-success">
              <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground text-xs">✓</span>
              </div>
              <span className="text-xs font-medium">Desbloqueada!</span>
            </div>
          </div>
        )}

        {/* Próximo nível */}
        {!isUnlocked && isNearCompletion && (
          <div className="bg-secondary/10 border border-secondary/20 rounded p-2 mt-2">
            <p className="text-xs text-secondary font-medium text-center">
              🔥 Quase lá! Faltam apenas {achievement.condition.value - progress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
