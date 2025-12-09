
import { Timer, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface GameTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  gameOver: boolean;
}

export const GameTimer = ({ timeRemaining, isRunning, gameOver }: GameTimerProps) => {
  const [shake, setShake] = useState(false);
  const isUrgent = timeRemaining <= 10 && !gameOver;
  const isCritical = timeRemaining <= 5 && !gameOver;
  const isWarning = timeRemaining <= 20 && timeRemaining > 10 && !gameOver;

  // Efeito de shake a cada segundo quando crítico
  useEffect(() => {
    if (isCritical && isRunning) {
      setShake(true);
      const timeout = setTimeout(() => setShake(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, isCritical, isRunning]);

  const getTimerVariant = () => {
    if (isCritical) return "critical";
    if (isUrgent) return "urgent";
    if (isWarning) return "warning";
    if (gameOver) return "finished";
    return "normal";
  };

  const variant = getTimerVariant();

  const variantStyles = {
    critical: "bg-gradient-to-r from-destructive to-destructive/90 border-destructive/50 text-destructive-foreground shadow-destructive/30 shadow-xl",
    urgent: "bg-gradient-to-r from-warning to-warning/90 border-warning/50 text-warning-foreground shadow-warning/30 shadow-lg",
    warning: "bg-gradient-to-r from-warning/80 to-warning/70 border-warning/40 text-warning-foreground shadow-warning/20 shadow-md",
    normal: "bg-gradient-to-r from-primary to-primary/90 border-primary/30 text-primary-foreground shadow-primary/20 shadow-lg",
    finished: "bg-gradient-to-r from-muted to-muted/90 border-muted-foreground/30 text-muted-foreground shadow-muted/20"
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300",
      "w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] text-center transform hover:scale-105 backdrop-blur-sm",
      variantStyles[variant],
      isCritical && "animate-pulse",
      shake && "animate-[shake_0.2s_ease-in-out]"
    )}>
      {/* Pulse ring effect para estados críticos */}
      {isCritical && (
        <>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-destructive/30 animate-ping" />
          <div className="absolute inset-[-4px] rounded-xl sm:rounded-2xl border-2 border-destructive/50 animate-pulse" />
        </>
      )}
      
      {/* Ícone principal */}
      <div className="relative z-10 flex items-center justify-center">
        {isCritical ? (
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-bounce" />
        ) : isUrgent ? (
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-pulse" />
        ) : (
          <Timer className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        )}
      </div>
      
      {/* Contador principal */}
      <div className="relative z-10 flex flex-col items-center">
        <div className={cn(
          "font-bold tabular-nums leading-none transition-all duration-200",
          "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
          isCritical && "scale-110"
        )}>
          {timeRemaining}s
        </div>
        
        {/* Status text */}
        <div className="mt-1 text-xs sm:text-sm font-medium opacity-90 hidden xs:block">
          {isCritical ? "⚠️ CRÍTICO!" : 
           isUrgent ? "🔥 URGENTE!" : 
           isWarning ? "⏰ Atenção!" :
           gameOver ? "Finalizado" : 
           "Tempo Restante"}
        </div>
      </div>

      {/* Barra de progresso visual */}
      {!gameOver && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/20 rounded-b-xl sm:rounded-b-2xl overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              isCritical ? "bg-destructive-foreground animate-pulse" : "bg-primary-foreground/80"
            )}
            style={{ 
              width: `${Math.max(0, (timeRemaining / 60) * 100)}%`,
              transition: "width 1s linear"
            }}
          />
        </div>
      )}

      {/* Indicador de alerta */}
      {isUrgent && !gameOver && (
        <div className="relative z-10 hidden sm:block">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 opacity-90 animate-pulse" />
        </div>
      )}
    </div>
  );
};
