
import { Timer, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  gameOver: boolean;
}

export const GameTimer = ({ timeRemaining, isRunning, gameOver }: GameTimerProps) => {
  const isUrgent = timeRemaining <= 10 && !gameOver;
  const isCritical = timeRemaining <= 5 && !gameOver;
  const isWarning = timeRemaining <= 20 && timeRemaining > 10 && !gameOver;

  const getTimerVariant = () => {
    if (isCritical) return "critical";
    if (isUrgent) return "urgent";
    if (isWarning) return "warning";
    if (gameOver) return "finished";
    return "normal";
  };

  const variant = getTimerVariant();

  const variantStyles = {
    critical: "bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white shadow-red-200 shadow-xl animate-pulse",
    urgent: "bg-gradient-to-r from-orange-400 to-orange-500 border-orange-400 text-white shadow-orange-200 shadow-lg",
    warning: "bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-400 text-white shadow-yellow-200 shadow-md",
    normal: "bg-gradient-to-r from-flu-grena to-flu-grena/90 border-flu-grena/30 text-white shadow-flu-grena/20 shadow-lg",
    finished: "bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300 text-white shadow-gray-200"
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300",
      "w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] text-center transform hover:scale-105 backdrop-blur-sm",
      variantStyles[variant]
    )}>
      {/* Pulse effect para estados críticos */}
      {isCritical && (
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-red-400/20 animate-ping"></div>
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
          isCritical && "animate-pulse"
        )}>
          {timeRemaining}s
        </div>
        
        {/* Status text - oculto em telas muito pequenas */}
        <div className="mt-1 text-xs sm:text-sm font-medium opacity-90 hidden xs:block">
          {isCritical ? "CRÍTICO!" : 
           isUrgent ? "URGENTE!" : 
           isWarning ? "Atenção!" :
           gameOver ? "Finalizado" : 
           "Tempo Restante"}
        </div>
      </div>

      {/* Barra de progresso visual */}
      {!gameOver && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl sm:rounded-b-2xl overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              isCritical ? "bg-white animate-pulse" : "bg-white/80"
            )}
            style={{ 
              width: `${Math.max(0, (timeRemaining / 60) * 100)}%`,
              transition: "width 1s linear"
            }}
          />
        </div>
      )}

      {/* Indicador de alerta - oculto em telas pequenas para não sobrecarregar */}
      {isUrgent && !gameOver && (
        <div className="relative z-10 hidden sm:block">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 animate-pulse" />
        </div>
      )}
    </div>
  );
};
