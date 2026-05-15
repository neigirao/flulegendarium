
import React from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { UnifiedPlayerImage } from "@/components/player-image/UnifiedPlayerImage";
import { cn } from "@/lib/utils";
import type { FeedbackState } from "./QuizFeedbackZone";

interface AdaptivePlayerImageProps {
  player: Player;
  onImageFixed: (imageUrl?: string) => void;
  difficulty: DifficultyLevel;
  feedbackState?: FeedbackState;
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
  difficulty,
  feedbackState = 'idle',
}: AdaptivePlayerImageProps) => {
  const effects = difficultyEffects[difficulty];

  const wrapperClass = feedbackState === 'correct'
    ? "relative p-[3px] rounded-2xl bg-secondary shadow-[0_0_24px_#006140] transition-all duration-300"
    : feedbackState === 'wrong'
    ? "relative p-[3px] rounded-2xl bg-destructive transition-all duration-300 animate-shake"
    : "relative p-[3px] rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary shadow-[0_0_24px_hsl(var(--secondary)/0.2)] transition-all duration-300";

  return (
    <div className="flex flex-col items-center w-full">
      <div className={wrapperClass}>
        <div
          className="relative rounded-[13px] overflow-hidden bg-card"
          style={{ aspectRatio: '4/5', filter: effects.filter, width: '100%' }}
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
