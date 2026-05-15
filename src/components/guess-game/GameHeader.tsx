
import { Star, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
  currentStreak?: number;
}

export const GameHeader = ({ score, onDebugClick, currentStreak = 0 }: GameHeaderProps) => {
  return (
    <header className="w-full">
      <div className="flex items-center gap-2">
        {/* Score card */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border shadow-sm">
          <Star className="w-4 h-4 text-warning shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Score</span>
            <span className="font-display text-xl text-foreground leading-none tabular-nums">{score}</span>
          </div>
        </div>

        {/* Streak card */}
        <div className={cn(
          "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm",
          currentStreak >= 2
            ? "bg-warning/10 border-warning/30"
            : "bg-card border-border"
        )}>
          <Flame className={cn(
            "w-4 h-4 shrink-0",
            currentStreak >= 2 ? "text-warning" : "text-muted-foreground"
          )} />
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Sequência</span>
            <span className={cn(
              "font-display text-xl leading-none tabular-nums",
              currentStreak >= 2 ? "text-warning" : "text-foreground"
            )}>{currentStreak}</span>
          </div>
        </div>

        {/* Debug button */}
        <button
          className="p-2 rounded-full bg-card hover:bg-accent border border-border shadow-sm transition-colors"
          onClick={onDebugClick}
          aria-label="Debug"
        >
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
