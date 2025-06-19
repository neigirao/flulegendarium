
import { useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { saveGameHistory } from "@/services/gameHistoryService";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

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
      console.log('📊 Registrando início de partida adaptativa');
      
      const { error } = await supabase
        .from('game_starts')
        .insert({
          user_id: user?.id || null,
          player_type: user ? 'authenticated' : 'guest',
          session_id: sessionIdRef.current,
          game_mode: 'adaptive'
        });

      if (error) {
        console.error('❌ Erro ao registrar início da partida adaptativa:', error);
      } else {
        console.log('✅ Início da partida adaptativa registrado');
      }
    } catch (error) {
      console.error('❌ Erro ao registrar início da partida adaptativa:', error);
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
      console.log('📊 Salvando estatística de dificuldade:', {
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
        console.error('❌ Erro ao salvar estatística de dificuldade:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar estatística de dificuldade:', error);
    }
  }, [user]);

  const saveGameData = useCallback(async (
    finalScore: number, 
    currentDifficultyLevel: string,
    difficultyMultiplier: number = 1.0
  ) => {
    if (!user?.id || !gameStartTimeRef.current) {
      console.log('⚠️ Modo adaptativo: Cannot save game data - missing user or start time');
      return;
    }

    try {
      const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

      console.log('💾 Salvando dados da partida adaptativa:', {
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
      console.error('❌ Erro ao salvar dados da partida adaptativa:', error);
    }
  }, [user]);

  const saveToRanking = useCallback(async (
    playerName: string, 
    finalScore: number, 
    currentDifficultyLevel: string
  ) => {
    try {
      console.log('🏆 Salvando pontuação adaptativa no ranking:', {
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
        console.error('❌ Erro ao salvar no ranking adaptativo:', error);
        throw error;
      }

      console.log('✅ Pontuação adaptativa salva no ranking');
    } catch (error) {
      console.error('❌ Erro ao salvar no ranking adaptativo:', error);
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
