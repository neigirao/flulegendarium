
import { useState, useEffect, useCallback, useRef } from "react";

export const TIME_LIMIT_SECONDS = 60;

export const useSimpleGameTimer = (onTimeUp: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    console.log('⏰ Iniciando timer');
    setTimeRemaining(TIME_LIMIT_SECONDS);
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    console.log('⏹️ Parando timer');
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    console.log('🔄 Resetando timer');
    stopTimer();
    setTimeRemaining(TIME_LIMIT_SECONDS);
  }, [stopTimer]);

  // Effect para controlar o timer
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onTimeUp]);

  return {
    timeRemaining,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer
  };
};
