
import React from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { UnifiedPlayerImage } from "@/components/player-image/UnifiedPlayerImage";
import { cn } from "@/lib/utils";

interface AdaptivePlayerImageProps {
  player: Player;
  onImageFixed: (imageUrl?: string) => void;
  difficulty: DifficultyLevel;
}

const difficultyEffects = {
  muito_facil: {
    filter: "brightness(1) contrast(1) saturate(1)",
    borderColor: "border-difficulty-very-easy",
    glowColor: "shadow-difficulty-very-easy/20"
  },
  facil: {
    filter: "brightness(0.95) contrast(1.05) saturate(0.95)",
    borderColor: "border-difficulty-easy",
    glowColor: "shadow-difficulty-easy/20"
  },
  medio: {
    filter: "brightness(0.9) contrast(1.1) saturate(0.9)",
    borderColor: "border-difficulty-medium",
    glowColor: "shadow-difficulty-medium/20"
  },
  dificil: {
    filter: "brightness(0.85) contrast(1.15) saturate(0.85)",
    borderColor: "border-difficulty-hard",
    glowColor: "shadow-difficulty-hard/20"
  },
  muito_dificil: {
    filter: "brightness(0.8) contrast(1.2) saturate(0.8)",
    borderColor: "border-difficulty-very-hard",
    glowColor: "shadow-difficulty-very-hard/20"
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
          className="relative rounded-2xl overflow-hidden bg-card w-80 h-80 md:w-96 md:h-96"
          style={{ filter: effects.filter }}
        >
          <UnifiedPlayerImage
            player={player}
            onImageLoaded={onImageFixed}
            difficulty={difficulty}
            priority={true}
          />
        </div>
        
        {/* Difficulty indicator overlay */}
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-card rounded-full shadow-lg border-2 border-border">
          <span className="text-sm font-bold text-foreground">
            {difficulty.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          Quem é este jogador?
        </p>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Dificuldade ajustada ao seu nível
        </p>
      </div>
    </div>
  );
};
