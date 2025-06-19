
import { useState, useEffect, useCallback, useRef } from "react";

export const TIME_LIMIT_SECONDS = 60;

export const useSimpleGameTimer = (timeLimit: number) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    console.log('⏰ Iniciando timer');
    setTimeRemaining(timeLimit);
    setIsRunning(true);
  }, [timeLimit]);

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
    setTimeRemaining(timeLimit);
  }, [stopTimer, timeLimit]);

  // Effect para controlar o timer
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
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
  }, [isRunning, timeRemaining]);

  return {
    timeRemaining,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer
  };
};
