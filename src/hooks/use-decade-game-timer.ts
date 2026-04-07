import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Timer fixo de 60 segundos para o modo Década.
 * Regra: ao acertar, o jogador recebe 60 segundos para a próxima rodada.
 */
const DECADE_TIME_LIMIT = 60;

interface UseDecadeGameTimerProps {
  onTimeUp: () => void;
}

export const useDecadeGameTimer = ({ onTimeUp }: UseDecadeGameTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(DECADE_TIME_LIMIT);
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
    setTimeRemaining(DECADE_TIME_LIMIT);
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
    setTimeRemaining(DECADE_TIME_LIMIT);
  }, [clearTimer]);

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
