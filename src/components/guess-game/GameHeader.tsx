
import { Star, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameTimer } from "./GameTimer";
import { ComboIndicator } from "./ComboIndicator";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
  timeRemaining?: number;
  gameActive?: boolean;
  currentStreak?: number;
  maxTime?: number;
}

export const GameHeader = ({ score, onDebugClick, timeRemaining, gameActive, currentStreak = 0, maxTime }: GameHeaderProps) => {
  return (
    <header className="w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Score card */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-card border border-border shadow-sm">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Score</span>
            <span className="text-lg sm:text-xl font-display text-foreground leading-none tabular-nums">{score}</span>
          </div>
        </div>

        {/* Timer circular */}
        {timeRemaining !== undefined && (
          <GameTimer
            timeRemaining={timeRemaining}
            isRunning={gameActive || false}
            gameOver={!gameActive}
            maxTime={maxTime}
          />
        )}

        {/* Combo + controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ComboIndicator streak={currentStreak} />
          <button
            className="p-1.5 sm:p-2 rounded-full bg-card hover:bg-accent border border-border shadow-sm transition-colors touch-target"
            onClick={onDebugClick}
            aria-label="Debug"
          >
            <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
