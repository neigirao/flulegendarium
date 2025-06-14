
import { useState, useRef, useCallback, useEffect } from "react";

export const useGameTimer = (initialTime: number) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Cleanup function for timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (isTimerRunning) return;
    
    console.log('⏰ Iniciando timer');
    
    // Clear any existing timer
    clearGameTimer();
    
    // Start with current time and begin countdown
    setIsTimerRunning(true);
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - timer will be stopped by the consuming component
          console.log('⏰ Tempo esgotado!');
          clearGameTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isTimerRunning, clearGameTimer]);

  // Stop timer
  const stopTimer = useCallback(() => {
    console.log('⏰ Parando timer');
    clearGameTimer();
  }, [clearGameTimer]);

  // Reset timer
  const resetTimer = useCallback(() => {
    console.log('⏰ Resetando timer');
    clearGameTimer();
    setTimeRemaining(initialTime);
  }, [clearGameTimer, initialTime]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return clearGameTimer;
  }, [clearGameTimer]);

  return {
    timeRemaining,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer,
    clearGameTimer,
  };
};
