
import { useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { saveGameHistory } from "@/services/gameHistoryService";

export const useGameMetrics = () => {
  const { user } = useAuth();
  
  // Game metrics for saving
  const gameStartTimeRef = useRef<number | null>(null);
  const totalAttemptsRef = useRef(0);
  const correctGuessesRef = useRef(0);

  // Save game history when game ends
  const saveGameData = useCallback(async (finalScore: number, isCorrect: boolean = false) => {
    if (!user?.id || !gameStartTimeRef.current) {
      console.log('⚠️ Cannot save game data - missing user or start time');
      return;
    }

    try {
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      const attempts = totalAttemptsRef.current + (isCorrect ? 1 : 0);
      const correct = correctGuessesRef.current + (isCorrect ? 1 : 0);

      console.log('💾 Saving game history:', {
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
      console.error('❌ Error saving game history:', error);
    }
  }, [user]);

  const startGameMetrics = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
  }, []);

  const incrementCorrectGuesses = useCallback(() => {
    correctGuessesRef.current += 1;
    totalAttemptsRef.current += 1;
  }, []);

  const incrementTotalAttempts = useCallback(() => {
    totalAttemptsRef.current += 1;
  }, []);

  const resetMetrics = useCallback(() => {
    gameStartTimeRef.current = null;
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
  }, []);

  return {
    saveGameData,
    startGameMetrics,
    incrementCorrectGuesses,
    incrementTotalAttempts,
    resetMetrics
  };
};
