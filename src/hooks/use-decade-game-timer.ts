
import { useState, useRef, useCallback, useEffect } from "react";

interface UseDecadeGameTimerProps {
  initialTime: number;
  onTimeUp: () => void;
}

export const useDecadeGameTimer = ({ initialTime = 60, onTimeUp }: UseDecadeGameTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setIsTimerRunning(true);
    
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, onTimeUp]);

  const stopTimer = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimeRemaining(initialTime);
  }, [clearTimer, initialTime]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    timeRemaining,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  };
};
