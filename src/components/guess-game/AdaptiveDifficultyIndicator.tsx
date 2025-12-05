
import React from "react";
import { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";
import { TrendingUp, Star, Zap, Award, Crown } from "lucide-react";

interface AdaptiveDifficultyIndicatorProps {
  currentDifficulty: DifficultyLevel;
  progress: number;
}

const difficultyConfig = {
  muito_facil: {
    label: "Muito Fácil",
    color: "bg-difficulty-very-easy",
    textColor: "text-difficulty-very-easy",
    bgColor: "bg-difficulty-very-easy/10",
    borderColor: "border-difficulty-very-easy/30",
    icon: Star,
    description: "Jogadores mais conhecidos"
  },
  facil: {
    label: "Fácil",
    color: "bg-difficulty-easy",
    textColor: "text-difficulty-easy",
    bgColor: "bg-difficulty-easy/10",
    borderColor: "border-difficulty-easy/30",
    icon: TrendingUp,
    description: "Ídolos populares"
  },
  medio: {
    label: "Médio",
    color: "bg-difficulty-medium",
    textColor: "text-difficulty-medium",
    bgColor: "bg-difficulty-medium/10",
    borderColor: "border-difficulty-medium/30",
    icon: Zap,
    description: "Jogadores históricos"
  },
  dificil: {
    label: "Difícil",
    color: "bg-difficulty-hard",
    textColor: "text-difficulty-hard",
    bgColor: "bg-difficulty-hard/10",
    borderColor: "border-difficulty-hard/30",
    icon: Award,
    description: "Lendas menos conhecidas"
  },
  muito_dificil: {
    label: "Muito Difícil",
    color: "bg-difficulty-very-hard",
    textColor: "text-difficulty-very-hard",
    bgColor: "bg-difficulty-very-hard/10",
    borderColor: "border-difficulty-very-hard/30",
    icon: Crown,
    description: "Apenas para experts"
  }
};

export const AdaptiveDifficultyIndicator = ({
  currentDifficulty,
  progress
}: AdaptiveDifficultyIndicatorProps) => {
  const config = difficultyConfig[currentDifficulty];
  const Icon = config.icon;

  return (
    <div className={cn(
      "relative p-3 rounded-xl border transition-all duration-300",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-full", config.color)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={cn("text-sm font-bold", config.textColor)}>
              Nível: {config.label}
            </h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        
        {/* Progress indicator compacto */}
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", config.textColor)}>{Math.round(progress)}%</span>
          <div className="w-12 bg-white/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500 rounded-full", config.color)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
