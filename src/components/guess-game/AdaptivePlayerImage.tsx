
import React from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { OptimizedPlayerImage } from "./OptimizedPlayerImage";
import { cn } from "@/lib/utils";

interface AdaptivePlayerImageProps {
  player: Player;
  onImageFixed: (imageUrl?: string) => void;
  difficulty: DifficultyLevel;
}

const difficultyEffects = {
  muito_facil: {
    filter: "brightness(1) contrast(1) saturate(1)",
    borderColor: "border-green-400",
    glowColor: "shadow-green-400/20"
  },
  facil: {
    filter: "brightness(0.95) contrast(1.05) saturate(0.95)",
    borderColor: "border-blue-400",
    glowColor: "shadow-blue-400/20"
  },
  medio: {
    filter: "brightness(0.9) contrast(1.1) saturate(0.9)",
    borderColor: "border-yellow-400",
    glowColor: "shadow-yellow-400/20"
  },
  dificil: {
    filter: "brightness(0.85) contrast(1.15) saturate(0.85)",
    borderColor: "border-orange-400",
    glowColor: "shadow-orange-400/20"
  },
  muito_dificil: {
    filter: "brightness(0.8) contrast(1.2) saturate(0.8)",
    borderColor: "border-red-400",
    glowColor: "shadow-red-400/20"
  }
};

export const AdaptivePlayerImage = ({
  player,
  onImageFixed,
  difficulty
}: AdaptivePlayerImageProps) => {
  const effects = difficultyEffects[difficulty];

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className={cn(
        "relative p-1 rounded-3xl border-4 transition-all duration-500 shadow-2xl",
        effects.borderColor,
        effects.glowColor
      )}>
        <div 
          className="relative rounded-2xl overflow-hidden bg-white"
          style={{ filter: effects.filter }}
        >
          <OptimizedPlayerImage
            player={player}
            onImageLoaded={onImageFixed}
            className="w-80 h-80 md:w-96 md:h-96 object-cover"
          />
        </div>
        
        {/* Difficulty indicator overlay */}
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-white rounded-full shadow-lg border-2 border-gray-100">
          <span className="text-sm font-bold text-gray-700">
            {difficulty.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg text-gray-600">
          Quem é este jogador?
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Dificuldade ajustada ao seu nível
        </p>
      </div>
    </div>
  );
};
