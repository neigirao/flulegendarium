
import { useState, useRef, useCallback, useEffect } from "react";

export const TIME_LIMIT_SECONDS = 60; // 1 minute timer

export const useGameTimer = (gameOver: boolean, onTimeUp: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Cleanup function for timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (gameOver || isRunning) return;
    
    console.log('⏰ Iniciando timer');
    
    // Clear any existing timer
    clearGameTimer();
    
    // Reset time and start
    setTimeRemaining(TIME_LIMIT_SECONDS);
    setIsRunning(true);
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up
          console.log('⏰ Tempo esgotado!');
          clearGameTimer();
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [gameOver, isRunning, clearGameTimer, onTimeUp]);

  // Stop timer
  const stopTimer = useCallback(() => {
    console.log('⏰ Parando timer');
    clearGameTimer();
    setTimeRemaining(TIME_LIMIT_SECONDS);
  }, [clearGameTimer]);

  // Clear timer when game is over
  useEffect(() => {
    if (gameOver) {
      clearGameTimer();
    }
  }, [gameOver, clearGameTimer]);

  // Cleanup timer when component unmounts
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
