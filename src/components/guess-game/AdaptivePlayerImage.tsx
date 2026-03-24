
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
  muito_facil: { filter: "brightness(1) contrast(1) saturate(1)" },
  facil: { filter: "brightness(0.95) contrast(1.05) saturate(0.95)" },
  medio: { filter: "brightness(0.9) contrast(1.1) saturate(0.9)" },
  dificil: { filter: "brightness(0.85) contrast(1.15) saturate(0.85)" },
  muito_dificil: { filter: "brightness(0.8) contrast(1.2) saturate(0.8)" },
};

export const AdaptivePlayerImage = ({
  player,
  onImageFixed,
  difficulty
}: AdaptivePlayerImageProps) => {
  const effects = difficultyEffects[difficulty];

  return (
    <div className="flex flex-col items-center">
      {/* Tricolor gradient border wrapper */}
      <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.25)]">
        <div
          className="relative rounded-[13px] overflow-hidden bg-card w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96"
          style={{ filter: effects.filter }}
        >
          <UnifiedPlayerImage
            player={player}
            onImageLoaded={onImageFixed}
            difficulty={difficulty}
            priority={true}
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground text-center">
        Quem é este jogador?
      </p>
    </div>
  );
};
