import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/guess-game";
import { convertStatistics } from "@/utils/statistics-converter";
import { useMemo } from "react";
import { logger } from "@/utils/logger";

interface DatabasePlayer {
  id: string;
  name: string | null;
  position: string | null;
  image_url: string;
  year_highlight: string | null;
  fun_fact: string | null;
  achievements: string[] | null;
  nicknames: string[] | null;
  statistics: any;
  difficulty_level: string | null;
  difficulty_score: number | null;
  difficulty_confidence: number | null;
  total_attempts: number | null;
  correct_attempts: number | null;
  average_guess_time: number | null;
}

export const usePlayersData = () => {
  const { data: rawPlayers = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async (): Promise<DatabasePlayer[]> => {
      try {
        logger.info('Carregando dados dos jogadores', 'PLAYERS_DATA');
        
        const { data, error } = await supabase
          .from('players')
          .select(`
            id,
            name,
            position,
            image_url,
            year_highlight,
            fun_fact,
            achievements,
            nicknames,
            statistics,
            difficulty_level,
            difficulty_score,
            difficulty_confidence,
            total_attempts,
            correct_attempts,
            average_guess_time
          `);
        
        if (error) {
          logger.error('Erro ao buscar jogadores', 'PLAYERS_DATA', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          logger.warn('Nenhum jogador encontrado no banco', 'PLAYERS_DATA');
          return [];
        }

        logger.info(`Jogadores carregados do banco: ${data.length}`, 'PLAYERS_DATA');
        
        // Log detalhado dos dados brutos do banco
        logger.debug('Dados brutos do banco', 'PLAYERS_DATA', { 
          total: data.length,
          sample: data.slice(0, 3).map(p => ({ 
            id: p.id, 
            name: p.name, 
            difficulty: p.difficulty_level 
          }))
        });
        
        // Log da distribuição de dificuldades
        const difficultyCount: Record<string, number> = {};
        data.forEach(player => {
          const difficulty = player.difficulty_level || 'sem_dificuldade';
          difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
        });
        logger.info('Distribuição de dificuldades (dados brutos)', 'PLAYERS_DATA', difficultyCount);
        
        return data;
      } catch (err) {
        logger.error('Exceção ao buscar jogadores', 'PLAYERS_DATA', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors  
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  // Memoize the transformation to prevent unnecessary re-renders
  const players = useMemo((): Player[] => {
    if (!rawPlayers || rawPlayers.length === 0) return [];

    logger.debug('Processando jogadores', 'PLAYERS_DATA');
    
    const processedPlayers = rawPlayers.map((player: DatabasePlayer) => {
      const enhancedPlayer: Player = {
        id: player.id,
        name: player.name || 'Nome não informado',
        position: player.position || 'Posição não informada',
        image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
        year_highlight: player.year_highlight || '',
        fun_fact: player.fun_fact || '',
        achievements: Array.isArray(player.achievements) ? player.achievements : [],
        nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
        statistics: convertStatistics(player.statistics),
        difficulty_level: player.difficulty_level as any || 'medio',
        difficulty_score: player.difficulty_score || 50,
        difficulty_confidence: player.difficulty_confidence || 0,
        total_attempts: player.total_attempts || 0,
        correct_attempts: player.correct_attempts || 0,
        average_guess_time: player.average_guess_time || 30000
      };
      
      logger.debug(`Jogador processado: ${enhancedPlayer.name}`, 'PLAYERS_DATA', {
        original_difficulty: player.difficulty_level,
        processed_difficulty: enhancedPlayer.difficulty_level
      });
      
      return enhancedPlayer;
    });

    // Log final da distribuição após processamento
    const finalDifficultyCount: Record<string, number> = {};
    processedPlayers.forEach(player => {
      const difficulty = player.difficulty_level || 'sem_dificuldade';
      finalDifficultyCount[difficulty] = (finalDifficultyCount[difficulty] || 0) + 1;
    });
    logger.info('Distribuição final de dificuldades (após processamento)', 'PLAYERS_DATA', finalDifficultyCount);

    return processedPlayers;
  }, [rawPlayers]);

  logger.debug('Hook usePlayersData', 'PLAYERS_DATA', { 
    players: players?.length || 0, 
    isLoading, 
    hasError: !!playersError 
  });

  return {
    players,
    isLoading,
    playersError
  };
};
