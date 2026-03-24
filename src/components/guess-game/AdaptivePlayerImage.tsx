
import React from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { UnifiedPlayerImage } from "@/components/player-image/UnifiedPlayerImage";

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
      {/* Tricolor gradient border */}
      <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary shadow-[0_0_24px_hsl(var(--secondary)/0.2)]">
        <div
          className="relative rounded-[13px] overflow-hidden bg-card w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80"
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
    </div>
  );
};
