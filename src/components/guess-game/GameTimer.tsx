
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface GameTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  gameOver: boolean;
  maxTime?: number;
}

export const GameTimer = ({ timeRemaining, isRunning, gameOver, maxTime = 60 }: GameTimerProps) => {
  const [shake, setShake] = useState(false);
  const lastVibrated = useRef<number>(-1);
  const isCritical = timeRemaining <= 5 && !gameOver;
  const isUrgent = timeRemaining <= 10 && !gameOver;

  useEffect(() => {
    if (isCritical && isRunning) {
      setShake(true);
      const timeout = setTimeout(() => setShake(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, isCritical, isRunning]);

  // Haptic feedback on mobile in last 5s
  useEffect(() => {
    if (isCritical && isRunning && timeRemaining !== lastVibrated.current) {
      lastVibrated.current = timeRemaining;
      try {
        navigator?.vibrate?.(80);
      } catch {
        // silent fallback
      }
    }
  }, [timeRemaining, isCritical, isRunning]);

  const progress = Math.max(0, timeRemaining / maxTime);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const strokeWidth = isCritical ? 8 : 6;

  const getStrokeColor = () => {
    if (isCritical) return "hsl(var(--destructive))";
    if (isUrgent) return "hsl(var(--warning))";
    return "hsl(var(--secondary))";
  };

  return (
    <div className={cn(
      "relative inline-flex items-center justify-center",
      shake && "animate-shake"
    )}>
      <svg width="88" height="88" viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r={radius}
          stroke="hsl(var(--muted) / 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx="50" cy="50" r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
          style={{
            filter: isCritical ? "drop-shadow(0 0 6px hsl(var(--destructive) / 0.6))" : 
                   isUrgent ? "drop-shadow(0 0 4px hsl(var(--warning) / 0.4))" :
                   "drop-shadow(0 0 4px hsl(var(--secondary) / 0.4))"
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "font-display text-2xl leading-none tabular-nums transition-all duration-300",
          isCritical ? "text-destructive animate-pulse scale-110" : isUrgent ? "text-warning" : "text-foreground"
        )}>
          {timeRemaining}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">seg</span>
      </div>
    </div>
  );
};
