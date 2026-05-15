
import React from "react";
import { DifficultyLevel } from "@/types/guess-game";
import { cn } from "@/lib/utils";

interface AdaptiveDifficultyIndicatorProps {
  currentDifficulty: DifficultyLevel;
  progress: number;
  vertical?: boolean;
  variant?: 'vertical' | 'horizontal' | 'horizontal-4';
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

// Maps 5-level system to 4 mockup segments
const segments4: { label: string; color: string; levels: DifficultyLevel[] }[] = [
  { label: "Fácil",   color: "bg-difficulty-very-easy", levels: ["muito_facil", "facil"] },
  { label: "Médio",   color: "bg-difficulty-medium",    levels: ["medio"] },
  { label: "Difícil", color: "bg-difficulty-hard",      levels: ["dificil"] },
  { label: "Expert",  color: "bg-difficulty-very-hard", levels: ["muito_dificil"] },
];

export const AdaptiveDifficultyIndicator = ({
  currentDifficulty,
  progress,
  vertical = true,
  variant,
}: AdaptiveDifficultyIndicatorProps) => {
  const currentNum = difficultyToNumber[currentDifficulty];
  const resolvedVariant = variant ?? (vertical ? 'vertical' : 'horizontal');

  if (resolvedVariant === 'horizontal-4') {
    const activeSegment = segments4.findIndex(s => s.levels.includes(currentDifficulty));
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          {segments4.map((seg, i) => (
            <div
              key={seg.label}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                i <= activeSegment ? seg.color : "bg-muted/30"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between px-0.5">
          {segments4.map((seg, i) => (
            <span
              key={seg.label}
              className={cn(
                "text-[9px] font-medium transition-colors duration-300",
                i === activeSegment ? "text-foreground font-bold" : "text-muted-foreground"
              )}
            >
              {seg.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (resolvedVariant === 'horizontal') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-sm">
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
