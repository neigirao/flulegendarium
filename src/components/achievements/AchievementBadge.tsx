
import { Achievement } from "@/types/achievements";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const AchievementBadge = ({ 
  achievement, 
  unlocked, 
  size = 'md',
  showDescription = true 
}: AchievementBadgeProps) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12 text-2xl';
      case 'md': return 'w-16 h-16 text-3xl';
      case 'lg': return 'w-20 h-20 text-4xl';
      default: return 'w-16 h-16 text-3xl';
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
      unlocked 
        ? "bg-white shadow-md border-gray-200" 
        : "bg-gray-50 border-gray-100 opacity-60"
    )}>
      <div className={cn(
        "rounded-full flex items-center justify-center relative",
        getSizeClasses(),
        unlocked ? getRarityColor(achievement.rarity) : "bg-gray-300"
      )}>
        <span className={cn(
          "filter",
          unlocked ? "" : "grayscale"
        )}>
          {achievement.icon}
        </span>
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <h4 className={cn(
          "font-semibold text-sm",
          unlocked ? "text-gray-900" : "text-gray-500"
        )}>
          {achievement.name}
        </h4>
        {showDescription && (
          <p className={cn(
            "text-xs mt-1",
            unlocked ? "text-gray-600" : "text-gray-400"
          )}>
            {achievement.description}
          </p>
        )}
        <Badge 
          variant="outline" 
          className={cn(
            "mt-2 text-xs",
            getRarityColor(achievement.rarity),
            "text-white border-none"
          )}
        >
          {achievement.rarity}
        </Badge>
      </div>
    </div>
  );
};
