import { useState, useRef, useCallback, useEffect } from "react";
import { logger } from "@/utils/logger";
import { getStoredTimerDuration, TimerDuration } from "./use-game-settings";

// Mantido para compatibilidade, mas agora usa valor do localStorage
export const TIME_LIMIT_SECONDS: number = 30;

interface UseCleanTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  timerDuration: TimerDuration;
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
  // Obter duração do timer do localStorage
  const timerDuration = getStoredTimerDuration();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(timerDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const durationRef = useRef<TimerDuration>(timerDuration);

  // Atualizar duração quando mudar no localStorage
  useEffect(() => {
    durationRef.current = timerDuration;
  }, [timerDuration]);

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
    
    // Sempre obter valor mais recente do localStorage
    const currentDuration = getStoredTimerDuration();
    durationRef.current = currentDuration;
    
    logger.debug('Timer started', 'TIMER', { timeRemaining: currentDuration });
    
    clearGameTimer();
    
    setTimeRemaining(currentDuration);
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
    setTimeRemaining(durationRef.current);
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
    timerDuration,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    clearGameTimer,
  };
};