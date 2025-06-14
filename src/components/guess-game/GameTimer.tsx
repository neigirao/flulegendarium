
import { Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface GameTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  gameOver: boolean;
}

export const GameTimer = ({ timeRemaining, isRunning, gameOver }: GameTimerProps) => {
  const [pulseAlert, setPulseAlert] = useState(false);

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determinar cor e estado baseado no tempo
  const getTimerState = () => {
    if (gameOver) return 'stopped';
    if (timeRemaining <= 10) return 'critical';
    if (timeRemaining <= 20) return 'warning';
    return 'normal';
  };

  const timerState = getTimerState();

  // Efeito de pulso para alertas críticos
  useEffect(() => {
    if (timerState === 'critical' && isRunning) {
      setPulseAlert(true);
      const interval = setInterval(() => {
        setPulseAlert(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setPulseAlert(false);
    }
  }, [timerState, isRunning]);

  const getTimerClasses = () => {
    const baseClasses = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg";
    
    switch (timerState) {
      case 'critical':
        return `${baseClasses} bg-red-500 text-white ${pulseAlert ? 'scale-110 shadow-2xl' : 'scale-105'} animate-pulse border-4 border-red-300`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white shadow-yellow-200`;
      case 'stopped':
        return `${baseClasses} bg-gray-400 text-white`;
      default:
        return `${baseClasses} bg-flu-verde text-white shadow-green-200`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={getTimerClasses()}>
        {timerState === 'critical' ? (
          <AlertTriangle className="w-6 h-6 animate-bounce" />
        ) : (
          <Clock className="w-6 h-6" />
        )}
        <span className="text-2xl md:text-3xl font-mono tracking-wider">
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* Status do timer */}
      <div className="text-center">
        {timerState === 'critical' && (
          <p className="text-red-600 font-semibold text-sm animate-pulse">
            ⚠️ TEMPO CRÍTICO!
          </p>
        )}
        {timerState === 'warning' && (
          <p className="text-yellow-600 font-medium text-sm">
            ⏰ Atenção ao tempo
          </p>
        )}
        {!isRunning && !gameOver && (
          <p className="text-gray-500 text-sm">
            Timer pausado
          </p>
        )}
      </div>
    </div>
  );
};
