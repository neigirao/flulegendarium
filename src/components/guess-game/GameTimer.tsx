
import { Timer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  gameOver: boolean;
}

export const GameTimer = ({ timeRemaining, isRunning, gameOver }: GameTimerProps) => {
  const isUrgent = timeRemaining <= 10 && !gameOver;
  const isCritical = timeRemaining <= 5 && !gameOver;

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg",
      "min-w-[140px] sm:min-w-[180px] text-center",
      isCritical 
        ? "bg-red-50 border-red-400 text-red-700 animate-pulse shadow-red-200" 
        : isUrgent 
        ? "bg-yellow-50 border-yellow-400 text-yellow-700 shadow-yellow-200"
        : gameOver
        ? "bg-gray-50 border-gray-300 text-gray-500"
        : "bg-flu-grena/5 border-flu-grena/30 text-flu-grena shadow-flu-grena/20"
    )}>
      <Timer className={cn(
        "transition-all duration-300",
        "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6",
        isCritical ? "animate-bounce" : ""
      )} />
      <div className="flex flex-col items-center">
        <span className={cn(
          "font-bold tabular-nums leading-none",
          "text-lg sm:text-xl md:text-2xl lg:text-3xl"
        )}>
          {timeRemaining}s
        </span>
        {isUrgent && !gameOver && (
          <span className="text-xs sm:text-sm font-medium opacity-80 mt-1">
            {isCritical ? "URGENTE!" : "Pouco tempo!"}
          </span>
        )}
      </div>
      {isUrgent && !gameOver && (
        <AlertTriangle className={cn(
          "text-current animate-pulse",
          "w-3 h-3 sm:w-4 sm:h-4"
        )} />
      )}
    </div>
  );
};
