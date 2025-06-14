
import { Achievement } from "@/types/achievements";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock, Star } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  showPoints?: boolean;
}

export const AchievementBadge = ({ 
  achievement, 
  unlocked, 
  size = 'md',
  showDescription = true,
  showPoints = true
}: AchievementBadgeProps) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 via-yellow-500 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12 text-xl';
      case 'md': return 'w-16 h-16 text-2xl';
      case 'lg': return 'w-20 h-20 text-3xl';
      default: return 'w-16 h-16 text-2xl';
    }
  };

  const isHidden = achievement.hidden && !unlocked;

  if (isHidden) {
    return (
      <div className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
        "bg-gray-100 border-gray-200 opacity-60"
      )}>
        <div className={cn(
          "rounded-full flex items-center justify-center bg-gray-300",
          getSizeClasses()
        )}>
          <Lock className="w-6 h-6 text-gray-500" />
        </div>
        <div className="text-center">
          <h4 className="font-semibold text-sm text-gray-500">???</h4>
          <p className="text-xs text-gray-400 mt-1">Conquista Secreta</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300",
      unlocked 
        ? "bg-white shadow-md border-gray-200 hover:shadow-lg transform hover:scale-105" 
        : "bg-gray-50 border-gray-100 opacity-70"
    )}>
      <div className={cn(
        "rounded-full flex items-center justify-center relative",
        getSizeClasses(),
        unlocked 
          ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-lg`
          : "bg-gray-300 text-gray-500"
      )}>
        <span className={cn(
          "filter transition-all duration-300",
          unlocked ? "drop-shadow-sm" : "grayscale"
        )}>
          {achievement.icon}
        </span>
        
        {/* Indicador de desbloqueado */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}

        {/* Efeito de brilho para lendárias */}
        {achievement.rarity === 'legendary' && unlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent 
                          animate-shimmer pointer-events-none" />
        )}
      </div>
      
      <div className="text-center space-y-1">
        <h4 className={cn(
          "font-semibold text-sm",
          unlocked ? "text-gray-900" : "text-gray-500"
        )}>
          {achievement.name}
        </h4>
        
        {showDescription && (
          <p className={cn(
            "text-xs leading-relaxed",
            unlocked ? "text-gray-600" : "text-gray-400"
          )}>
            {achievement.description}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              unlocked 
                ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white border-none`
                : "bg-gray-200 text-gray-500 border-gray-300"
            )}
          >
            {achievement.rarity}
          </Badge>
          
          {showPoints && achievement.points > 0 && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              unlocked ? "text-flu-grena" : "text-gray-400"
            )}>
              <Star className="w-3 h-3" />
              <span>{achievement.points}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
