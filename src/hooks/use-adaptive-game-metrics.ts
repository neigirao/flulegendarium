
import { useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { saveGameHistory } from "@/services/gameHistoryService";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "@/utils/logger";

export const useAdaptiveGameMetrics = () => {
  const { user } = useAuth();
  const gameStartTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const totalAttemptsRef = useRef(0);
  const correctGuessesRef = useRef(0);
  const currentStreakRef = useRef(0);
  const maxStreakRef = useRef(0);

  const startMetricsTracking = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    sessionIdRef.current = uuidv4();
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
    currentStreakRef.current = 0;
    maxStreakRef.current = 0;
    
    // Registrar início de partida adaptativa
    registerGameStart();
  }, []);

  const registerGameStart = useCallback(async () => {
    try {
      logger.info('Registrando início de partida adaptativa', 'GAME_METRICS');
      
      const { error } = await supabase
        .from('game_starts')
        .insert({
          user_id: user?.id || null,
          player_type: user ? 'authenticated' : 'guest',
          session_id: sessionIdRef.current,
          game_mode: 'adaptive'
        });

      if (error) {
        logger.error('Erro ao registrar início da partida adaptativa', 'GAME_METRICS', error);
      } else {
        logger.info('Início da partida adaptativa registrado', 'GAME_METRICS');
      }
    } catch (error) {
      logger.error('Erro ao registrar início da partida adaptativa', 'GAME_METRICS', error);
    }
  }, [user]);

  const incrementAttempts = useCallback(() => {
    totalAttemptsRef.current += 1;
  }, []);

  const recordCorrectGuess = useCallback((playerId: string, playerName: string, difficultyLevel: string, guessTime: number) => {
    correctGuessesRef.current += 1;
    totalAttemptsRef.current += 1;
    currentStreakRef.current += 1;
    
    if (currentStreakRef.current > maxStreakRef.current) {
      maxStreakRef.current = currentStreakRef.current;
    }

    // Salvar estatística de dificuldade
    saveDifficultyStats(playerId, playerName, difficultyLevel, guessTime, true);
  }, []);

  const recordIncorrectGuess = useCallback((playerId: string, playerName: string, difficultyLevel: string, guessTime: number) => {
    totalAttemptsRef.current += 1;
    currentStreakRef.current = 0;

    // Salvar estatística de dificuldade
    saveDifficultyStats(playerId, playerName, difficultyLevel, guessTime, false);
  }, []);

  const saveDifficultyStats = useCallback(async (
    playerId: string, 
    playerName: string, 
    difficultyLevel: string, 
    guessTime: number, 
    isCorrect: boolean
  ) => {
    try {
      logger.debug('Salvando estatística de dificuldade', 'GAME_METRICS', {
        playerId,
        playerName,
        difficultyLevel,
        guessTime,
        isCorrect
      });

      const { error } = await supabase
        .from('player_difficulty_stats')
        .insert({
          player_id: playerId,
          user_id: user?.id || null,
          guess_time: guessTime,
          is_correct: isCorrect,
          session_id: sessionIdRef.current,
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        });

      if (error) {
        logger.error('Erro ao salvar estatística de dificuldade', 'GAME_METRICS', error);
      }
    } catch (error) {
      logger.error('Erro ao salvar estatística de dificuldade', 'GAME_METRICS', error);
    }
  }, [user]);

  const saveGameData = useCallback(async (
    finalScore: number, 
    currentDifficultyLevel: string,
    difficultyMultiplier: number = 1.0
  ) => {
    if (!user?.id || !gameStartTimeRef.current) {
      logger.warn('Modo adaptativo: Cannot save game data - missing user or start time', 'GAME_METRICS');
      return;
    }

    try {
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

      logger.info('Salvando dados da partida adaptativa', 'GAME_METRICS', {
        userId: user.id,
        score: finalScore,
        correct_guesses: correctGuessesRef.current,
        total_attempts: totalAttemptsRef.current,
        max_streak: maxStreakRef.current,
        game_duration: gameDuration,
        difficulty_level: currentDifficultyLevel,
        difficulty_multiplier: difficultyMultiplier
      });

      await saveGameHistory({
        user_id: user.id,
        score: finalScore,
        correct_guesses: correctGuessesRef.current,
        total_attempts: totalAttemptsRef.current,
        current_streak: currentStreakRef.current,
        max_streak: maxStreakRef.current,
        game_duration: gameDuration,
        game_mode: 'adaptive',
        difficulty_level: currentDifficultyLevel,
        difficulty_multiplier: difficultyMultiplier
      });

    } catch (error) {
      logger.error('Erro ao salvar dados da partida adaptativa', 'GAME_METRICS', error);
    }
  }, [user]);

  const saveToRanking = useCallback(async (
    playerName: string, 
    finalScore: number, 
    currentDifficultyLevel: string
  ) => {
    try {
      logger.info('Salvando pontuação adaptativa no ranking', 'GAME_METRICS', {
        playerName,
        score: finalScore,
        difficulty_level: currentDifficultyLevel
      });

      const { error } = await supabase
        .from('rankings')
        .insert({
          player_name: playerName,
          score: finalScore,
          user_id: user?.id || null,
          game_mode: 'adaptive',
          difficulty_level: currentDifficultyLevel,
          games_played: 1
        });

      if (error) {
        logger.error('Erro ao salvar no ranking adaptativo', 'GAME_METRICS', error);
        throw error;
      }

      logger.info('Pontuação adaptativa salva no ranking', 'GAME_METRICS');
    } catch (error) {
      logger.error('Erro ao salvar no ranking adaptativo', 'GAME_METRICS', error);
      throw error;
    }
  }, [user]);

  const resetMetrics = useCallback(() => {
    gameStartTimeRef.current = null;
    sessionIdRef.current = null;
    totalAttemptsRef.current = 0;
    correctGuessesRef.current = 0;
    currentStreakRef.current = 0;
    maxStreakRef.current = 0;
  }, []);

  const getCurrentStats = useCallback(() => ({
    totalAttempts: totalAttemptsRef.current,
    correctGuesses: correctGuessesRef.current,
    currentStreak: currentStreakRef.current,
    maxStreak: maxStreakRef.current,
    sessionId: sessionIdRef.current
  }), []);

  return {
    startMetricsTracking,
    incrementAttempts,
    recordCorrectGuess,
    recordIncorrectGuess,
    saveGameData,
    saveToRanking,
    resetMetrics,
    getCurrentStats
  };
};
