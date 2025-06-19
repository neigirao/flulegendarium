
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
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: Star,
    description: "Jogadores mais conhecidos"
  },
  facil: {
    label: "Fácil",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: TrendingUp,
    description: "Ídolos populares"
  },
  medio: {
    label: "Médio",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Zap,
    description: "Jogadores históricos"
  },
  dificil: {
    label: "Difícil",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: Award,
    description: "Lendas menos conhecidas"
  },
  muito_dificil: {
    label: "Muito Difícil",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
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
      "relative p-6 rounded-2xl border-2 transition-all duration-300",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", config.color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={cn("text-lg font-bold", config.textColor)}>
              Nível: {config.label}
            </h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progresso para próximo nível</span>
          <span className={cn("font-medium", config.textColor)}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500 rounded-full", config.color)}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Level badges */}
      <div className="flex justify-center mt-4 gap-1">
        {Object.keys(difficultyConfig).map((level, index) => {
          const isActive = Object.keys(difficultyConfig).indexOf(currentDifficulty) >= index;
          return (
            <div
              key={level}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isActive ? difficultyConfig[level as DifficultyLevel].color : "bg-gray-300"
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
