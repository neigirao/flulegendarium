
import React from "react";
import { GameTimer } from "./GameTimer";
import { Clock, Target, TrendingUp, Award } from "lucide-react";

interface AdaptiveGameStatusProps {
  timeRemaining: number;
  currentStreak: number;
  gamesPlayed: number;
  maxStreak: number;
  attempts: string[];
  gameActive: boolean;
}

export const AdaptiveGameStatus = ({
  timeRemaining,
  currentStreak,
  gamesPlayed,
  maxStreak,
  attempts,
  gameActive
}: AdaptiveGameStatusProps) => {
  return (
    <div className="flex gap-4">
      {/* Timer */}
      <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Tempo</span>
        </div>
        <GameTimer 
          timeRemaining={timeRemaining} 
          isRunning={gameActive} 
          gameOver={!gameActive}
        />
      </div>
    </div>
  );
};
