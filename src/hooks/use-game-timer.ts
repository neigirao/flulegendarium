
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const TIME_LIMIT_SECONDS = 60; // 1 minute timer

export const useGameTimer = (gameOver: boolean, onTimeUp: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Cleanup function for timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (gameOver) return;
    
    // Clear any existing timer
    clearGameTimer();
    
    // Reset time
    setTimeRemaining(TIME_LIMIT_SECONDS);
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up
          clearGameTimer();
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [gameOver, clearGameTimer, onTimeUp]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return clearGameTimer;
  }, [clearGameTimer]);

  return {
    timeRemaining,
    startTimer,
    clearGameTimer,
  };
};
