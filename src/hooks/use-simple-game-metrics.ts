import { useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { saveGameHistory } from "@/services/gameHistoryService";
import { logger } from "@/utils/logger";

export const useSimpleGameMetrics = () => {
  const { user } = useAuth();
  const gameStartTimeRef = useRef<number | null>(null);
  const totalAttemptsRef = useRef(0);
  const correctGuessesRef = useRef(0);

  const startMetricsTracking = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
  }, []);

  const incrementAttempts = useCallback(() => {
    totalAttemptsRef.current += 1;
  }, []);

  const incrementCorrectGuesses = useCallback(() => {
    correctGuessesRef.current += 1;
    totalAttemptsRef.current += 1;
  }, []);

  const saveGameData = useCallback(async (finalScore: number, isCorrect: boolean = false) => {
    if (!user?.id || !gameStartTimeRef.current) {
      logger.warn('Cannot save game data - missing user or start time', 'GAME_METRICS');
      return;
    }

    try {
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const attempts = totalAttemptsRef.current + (isCorrect ? 1 : 0);
      const correct = correctGuessesRef.current + (isCorrect ? 1 : 0);

      logger.info('Saving game history', 'GAME_METRICS', {
        userId: user.id,
        score: finalScore,
        correct_guesses: correct,
        total_attempts: attempts,
        game_duration: gameDuration
      });

      await saveGameHistory({
        user_id: user.id,
        score: finalScore,
        correct_guesses: correct,
        total_attempts: attempts,
        game_duration: gameDuration
      });

    } catch (error) {
      logger.error('Error saving game history', 'GAME_METRICS', error);
    }
  }, [user]);

  const resetMetrics = useCallback(() => {
    gameStartTimeRef.current = null;
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
  }, []);

  return {
    startMetricsTracking,
    incrementAttempts,
    incrementCorrectGuesses,
    saveGameData,
    resetMetrics
  };
};
