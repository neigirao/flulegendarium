import { useState, useRef, useCallback, useEffect } from "react";
import { logger } from "@/utils/logger";

/**
 * Timer fixo de 60 segundos por rodada.
 * Regra: ao acertar, o jogador recebe 60 segundos para a próxima rodada.
 * Não é configurável pelo usuário.
 */
export const TIME_LIMIT_SECONDS = 60;

interface UseCleanTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  clearGameTimer: () => void;
}

export const useCleanTimer = (
  gameOver: boolean, 
  onTimeUp: () => void
): UseCleanTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<number>(TIME_LIMIT_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const clearGameTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const startTimer = useCallback((): void => {
    if (gameOver) return;
    
    logger.debug('Timer started', 'TIMER', { timeRemaining: TIME_LIMIT_SECONDS });
    
    clearGameTimer();
    
    setTimeRemaining(TIME_LIMIT_SECONDS);
    setIsRunning(true);
    setIsPaused(false);
    
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          logger.debug('Timer expired');
          clearGameTimer();
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [gameOver, clearGameTimer, onTimeUp]);

  const pauseTimer = useCallback((): void => {
    if (isRunning && !isPaused) {
      logger.debug('Timer paused', 'TIMER', { timeRemaining });
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPaused(true);
      setIsRunning(false);
    }
  }, [isRunning, isPaused, timeRemaining]);

  const resumeTimer = useCallback((): void => {
    if (isPaused && !gameOver) {
      logger.debug('Timer resumed', 'TIMER', { timeRemaining });
      setIsPaused(false);
      setIsRunning(true);
      
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            logger.debug('Timer expired after resume');
            clearGameTimer();
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isPaused, gameOver, clearGameTimer, onTimeUp, timeRemaining]);

  const stopTimer = useCallback((): void => {
    logger.debug('Timer stopped');
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
    isPaused,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    clearGameTimer,
  };
};
