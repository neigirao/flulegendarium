
import { useState, useRef, useCallback, useEffect } from "react";

export const TIME_LIMIT_SECONDS: number = 60;

interface UseGameTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  clearGameTimer: () => void;
}

export const useGameTimer = (
  gameOver: boolean, 
  onTimeUp: () => void
): UseGameTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<number>(TIME_LIMIT_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const clearGameTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const startTimer = useCallback((): void => {
    if (gameOver) return;
    
    console.log('⏰ Iniciando timer do começo');
    
    clearGameTimer();
    
    setTimeRemaining(TIME_LIMIT_SECONDS);
    setIsRunning(true);
    
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          console.log('⏰ Tempo esgotado!');
          clearGameTimer();
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [gameOver, clearGameTimer, onTimeUp]);

  const stopTimer = useCallback((): void => {
    console.log('⏰ Parando timer');
    clearGameTimer();
    setTimeRemaining(TIME_LIMIT_SECONDS);
  }, [clearGameTimer]);

  useEffect(() => {
    if (gameOver) {
      clearGameTimer();
    }
  }, [gameOver, clearGameTimer]);

  useEffect(() => {
    return clearGameTimer;
  }, [clearGameTimer]);

  return {
    timeRemaining,
    isRunning,
    startTimer,
    stopTimer,
    clearGameTimer,
  };
};
