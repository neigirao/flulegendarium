
import React from "react";
import { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";

interface AdaptiveDifficultyIndicatorProps {
  currentDifficulty: DifficultyLevel;
  progress: number;
  vertical?: boolean;
}

const difficultyLevels: { key: DifficultyLevel; label: string; color: string }[] = [
  { key: "muito_dificil", label: "5", color: "bg-difficulty-very-hard" },
  { key: "dificil", label: "4", color: "bg-difficulty-hard" },
  { key: "medio", label: "3", color: "bg-difficulty-medium" },
  { key: "facil", label: "2", color: "bg-difficulty-easy" },
  { key: "muito_facil", label: "1", color: "bg-difficulty-very-easy" },
];

const difficultyToNumber: Record<DifficultyLevel, number> = {
  muito_facil: 1,
  facil: 2,
  medio: 3,
  dificil: 4,
  muito_dificil: 5,
};

export const AdaptiveDifficultyIndicator = ({
  currentDifficulty,
  progress,
  vertical = true,
}: AdaptiveDifficultyIndicatorProps) => {
  const currentNum = difficultyToNumber[currentDifficulty];

  if (!vertical) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/10 border border-border/20 backdrop-blur-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nível</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={cn(
                "w-2 h-4 rounded-sm transition-all duration-300",
                n <= currentNum ? difficultyLevels.find(d => difficultyToNumber[d.key] === n)?.color : "bg-muted/30"
              )}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-foreground">{currentNum}/5</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Nível
      </span>
      <div className="flex flex-col gap-0.5 sm:gap-1">
        {difficultyLevels.map((level) => {
          const num = difficultyToNumber[level.key];
          const isActive = num <= currentNum;
          return (
            <div
              key={level.key}
              className={cn(
                "w-2.5 sm:w-3 h-5 sm:h-6 rounded-sm transition-all duration-300",
                isActive ? level.color : "bg-muted/20"
              )}
              title={`Nível ${num}`}
            />
          );
        })}
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-foreground tabular-nums">{currentNum}/5</span>
    </div>
  );
};
