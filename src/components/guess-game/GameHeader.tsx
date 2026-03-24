
import { Star, Info } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="flex items-center justify-between gap-3">
        {/* Score card */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/10 border border-border/20 backdrop-blur-sm min-w-[100px]">
          <Star className="w-4 h-4 text-warning shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Score</span>
            <span className="text-xl font-display text-foreground leading-none tabular-nums">{score}</span>
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
        <div className="flex items-center gap-2">
          <ComboIndicator streak={currentStreak} />
          <button
            className="p-2 rounded-full bg-card/10 hover:bg-card/20 border border-border/20 transition-colors backdrop-blur-sm"
            onClick={onDebugClick}
            aria-label="Debug"
          >
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
