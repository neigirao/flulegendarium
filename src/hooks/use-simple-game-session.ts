
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const useGameSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const registerGameStart = useCallback(async () => {
    try {
      const newSessionId = uuidv4();
      
      console.log('📊 Registrando início de jogo com sessionId:', newSessionId);
      
      const { error } = await supabase
        .from('game_starts')
        .insert({
          session_id: newSessionId,
          player_type: 'guest'
        });

      if (error) {
        console.error('❌ Erro ao registrar início do jogo:', error);
        return;
      }

      setSessionId(newSessionId);
      console.log('✅ Início de jogo registrado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar início do jogo:', error);
    }
  }, []);

  const saveGameSession = useCallback(async (
    playerName: string,
    totalCorrect: number, 
    totalAttempts: number, 
    maxStreak: number
  ) => {
    try {
      console.log('📊 Salvando sessão completa:', {
        playerName,
        totalCorrect,
        totalAttempts,
        maxStreak
      });

      const { error } = await supabase
        .from('game_sessions')
        .insert({
          player_name: playerName,
          total_correct: totalCorrect,
          total_attempts: totalAttempts,
          max_streak: maxStreak
        });

      if (error) {
        console.error('❌ Erro ao salvar sessão:', error);
      } else {
        console.log('✅ Sessão salva com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
    }
  }, []);

  const saveGameAttempt = useCallback(async (
    targetPlayerName: string,
    guess: string,
    isCorrect: boolean,
    attemptNumber: number = 1
  ) => {
    try {
      console.log('📊 Salvando tentativa:', {
        targetPlayerName,
        guess,
        isCorrect,
        attemptNumber
      });

      const { error } = await supabase
        .from('game_attempts')
        .insert({
          target_player_name: targetPlayerName,
          player_name: guess,
          guess: guess,
          is_correct: isCorrect,
          attempt_number: attemptNumber
        });

      if (error) {
        console.error('❌ Erro ao salvar tentativa:', error);
      } else {
        console.log('✅ Tentativa salva com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar tentativa:', error);
    }
  }, []);

  const resetSession = useCallback(() => {
    setSessionId(null);
  }, []);

  return {
    sessionId,
    registerGameStart,
    saveGameSession,
    saveGameAttempt,
    resetSession
  };
};
