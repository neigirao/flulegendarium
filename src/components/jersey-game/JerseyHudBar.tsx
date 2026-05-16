import { cn } from "@/lib/utils";

interface JerseyHudBarProps {
  score: number;
  timeRemaining: number;
  isRunning: boolean;
  gameOver: boolean;
  jerseyNumber: number;
  maxTime?: number;
}

export const JerseyHudBar = ({
  score,
  timeRemaining,
  isRunning,
  gameOver,
  jerseyNumber,
  maxTime = 30,
}: JerseyHudBarProps) => {
  const urgent = timeRemaining < 15 && !gameOver;
  const radius = 24;
  const dash = 2 * Math.PI * radius;
  const offset = dash - dash * (timeRemaining / maxTime);

  return (
    <div className="flex gap-3 items-center bg-card border border-border rounded-2xl px-5 py-3 shadow-sm mb-7">
      {/* Score */}
      <div className="text-center px-4">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Score</div>
        <div className="font-display text-[26px] leading-none text-primary">{score}</div>
      </div>

      {/* Timer + label */}
      <div className="border-l border-border pl-4 flex items-center gap-3">
        <div className="relative w-14 h-14">
          <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="28" cy="28" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
            <circle
              cx="28" cy="28" r={radius} fill="none"
              stroke={urgent ? "hsl(var(--destructive))" : "hsl(var(--secondary))"}
              strokeWidth="4"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              "font-display text-[18px] leading-none",
              urgent ? "text-destructive" : "text-foreground"
            )}>
              {timeRemaining}
            </span>
            <span className="text-[7px] text-muted-foreground">SEG</span>
          </div>
        </div>
        <div className="text-left">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Tempo</div>
          <div className={cn("text-xs font-semibold", urgent ? "text-destructive" : "text-foreground")}>
            {urgent ? "Atenção!" : "Pensando..."}
          </div>
        </div>
      </div>

      {/* Jersey counter */}
      <div className="border-l border-border pl-4 text-center px-4">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Camisa</div>
        <div className="font-display text-[26px] leading-none text-secondary">{jerseyNumber}</div>
      </div>

      <div className="flex-1" />

      {/* Mode badge */}
      <div className="bg-accent/10 text-accent border border-accent/20 rounded-xl px-3 py-2 text-xs font-bold tracking-wide flex items-center gap-1.5">
        👕 Modo Camisas
      </div>
    </div>
  );
};
