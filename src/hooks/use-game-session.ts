
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useGameSession = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const registerGameStart = useCallback(async () => {
    try {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      
      const { error } = await supabase
        .from('game_starts')
        .insert([
          {
            user_id: user?.id || null,
            player_type: user ? 'authenticated' : 'guest',
            session_id: newSessionId,
            started_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Erro ao registrar início da partida:', error);
      } else {
        console.log('✅ Início da partida registrado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar início da partida:', error);
    }
  }, [user]);

  const resetSession = useCallback(() => {
    setSessionId(null);
  }, []);

  return {
    sessionId,
    registerGameStart,
    resetSession
  };
};
