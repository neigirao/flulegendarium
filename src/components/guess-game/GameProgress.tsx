
import { Trophy, Target, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameProgressProps {
  currentScore: number;
  gamesPlayed?: number;
  currentStreak?: number;
  maxStreak?: number;
}

export const GameProgress = ({
  currentScore,
  gamesPlayed = 0,
  currentStreak = 0,
  maxStreak = 0
}: GameProgressProps) => {
  const stats = [
    {
      icon: Trophy,
      label: "Pontos",
      value: currentScore,
      color: "primary",
      bgColor: "bg-gradient-to-br from-primary/10 to-primary/5",
      borderColor: "border-primary/20",
      iconColor: "text-primary",
      valueColor: "text-primary",
      highlight: currentScore > 0
    },
    {
      icon: Target,
      label: "Jogos",
      value: gamesPlayed,
      color: "secondary",
      bgColor: "bg-gradient-to-br from-secondary/10 to-secondary/5",
      borderColor: "border-secondary/20",
      iconColor: "text-secondary",
      valueColor: "text-secondary",
      highlight: gamesPlayed > 0
    },
    {
      icon: Zap,
      label: "Sequência",
      value: currentStreak,
      color: "orange",
      bgColor: "bg-gradient-to-br from-orange-100 to-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-500",
      valueColor: "text-orange-600",
      highlight: currentStreak > 0
    },
    {
      icon: TrendingUp,
      label: "Recorde",
      value: maxStreak,
      color: "purple",
      bgColor: "bg-gradient-to-br from-purple-100 to-purple-50",
      borderColor: "border-purple-200",
      iconColor: "text-purple-500",
      valueColor: "text-purple-600",
      highlight: maxStreak > 0
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-default group",
              stat.bgColor,
              stat.borderColor,
              stat.highlight ? "shadow-md hover:shadow-lg" : "opacity-75"
            )}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="relative p-4 flex flex-col items-center text-center space-y-3">
              {/* Icon with animation */}
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                "bg-white/80 group-hover:bg-white/90 group-hover:scale-110",
                stat.highlight && "animate-pulse"
              )}>
                <Icon className={cn("w-6 h-6", stat.iconColor)} />
              </div>
              
              {/* Label */}
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                {stat.label}
              </span>
              
              {/* Value with enhanced styling */}
              <div className={cn(
                "text-2xl lg:text-3xl font-bold tabular-nums transition-all duration-300",
                stat.valueColor,
                stat.highlight && "animate-fadeIn"
              )}>
                {stat.value}
              </div>
            </div>

            {/* Highlight effect for active stats */}
            {stat.highlight && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
