import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Jersey } from "@/types/jersey-game";
import { useMemo } from "react";
import { logger } from "@/utils/logger";
import { shuffleJerseysByDifficulty } from "@/utils/jersey-game/shuffleJerseys";

interface DatabaseJersey {
  id: string;
  years: number[];
  image_url: string;
  type: string;
  manufacturer: string | null;
  season: string | null;
  title: string | null;
  fun_fact: string | null;
  nicknames: string[] | null;
  difficulty_level: string | null;
  difficulty_score: number | null;
  difficulty_confidence: number | null;
  total_attempts: number | null;
  correct_attempts: number | null;
  average_guess_time: number | null;
  decades: string[] | null;
  created_at: string;
}

/**
 * Hook para carregar e gerenciar dados das camisas do Fluminense.
 * 
 * Carrega todas as camisas do banco de dados e processa para uso no jogo.
 * Inclui cache de 5 minutos e retry automático em caso de falha.
 * 
 * @returns {Object} Dados das camisas e estado de carregamento
 */
export const useJerseysData = () => {
  const { data: rawJerseys = [], isLoading, error: jerseysError } = useQuery({
    queryKey: ['jerseys'],
    queryFn: async (): Promise<DatabaseJersey[]> => {
      try {
        logger.info('Carregando dados das camisas', 'JERSEYS_DATA');
        
        const { data, error } = await supabase
          .from('jerseys')
          .select(`
            id,
            years,
            image_url,
            type,
            manufacturer,
            season,
            title,
            fun_fact,
            nicknames,
            difficulty_level,
            difficulty_score,
            difficulty_confidence,
            total_attempts,
            correct_attempts,
            average_guess_time,
            decades,
            created_at
          `);
        
        if (error) {
          logger.error('Erro ao buscar camisas', 'JERSEYS_DATA', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          logger.warn('Nenhuma camisa encontrada no banco', 'JERSEYS_DATA');
          return [];
        }

        logger.info(`Camisas carregadas do banco: ${data.length}`, 'JERSEYS_DATA');
        
        // Log da distribuição de dificuldades
        const difficultyCount: Record<string, number> = {};
        data.forEach(jersey => {
          const difficulty = jersey.difficulty_level || 'sem_dificuldade';
          difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
        });
        logger.info('Distribuição de dificuldades das camisas', 'JERSEYS_DATA', difficultyCount);
        
        return data;
      } catch (err) {
        logger.error('Exceção ao buscar camisas', 'JERSEYS_DATA', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  // Memoize the transformation
  const jerseys = useMemo((): Jersey[] => {
    if (!rawJerseys || rawJerseys.length === 0) return [];

    logger.debug('Processando camisas', 'JERSEYS_DATA');
    
    const processedJerseys = rawJerseys.map((jersey: DatabaseJersey): Jersey => ({
      id: jersey.id,
      years: Array.isArray(jersey.years) ? jersey.years : [jersey.years],
      image_url: jersey.image_url,
      type: jersey.type as Jersey['type'],
      manufacturer: jersey.manufacturer,
      season: jersey.season,
      title: jersey.title,
      fun_fact: jersey.fun_fact,
      nicknames: Array.isArray(jersey.nicknames) ? jersey.nicknames : [],
      difficulty_level: jersey.difficulty_level as any || 'medio',
      difficulty_score: jersey.difficulty_score || 50,
      difficulty_confidence: jersey.difficulty_confidence || 0,
      total_attempts: jersey.total_attempts || 0,
      correct_attempts: jersey.correct_attempts || 0,
      average_guess_time: jersey.average_guess_time || 30000,
      decades: Array.isArray(jersey.decades) ? jersey.decades : [],
      created_at: jersey.created_at
    }));

    // Log final da distribuição
    const finalDifficultyCount: Record<string, number> = {};
    processedJerseys.forEach(jersey => {
      const difficulty = jersey.difficulty_level || 'sem_dificuldade';
      finalDifficultyCount[difficulty] = (finalDifficultyCount[difficulty] || 0) + 1;
    });
    logger.info('Distribuição final de dificuldades das camisas', 'JERSEYS_DATA', finalDifficultyCount);

    // Embaralhar camisas para ordem aleatória a cada carregamento
    const shuffledJerseys = shuffleJerseysByDifficulty(processedJerseys);
    logger.info(`Camisas embaralhadas: ${shuffledJerseys.length}`, 'JERSEYS_DATA');

    return shuffledJerseys;
  }, [rawJerseys]);

  logger.debug('Hook useJerseysData', 'JERSEYS_DATA', { 
    jerseys: jerseys?.length || 0, 
    isLoading, 
    hasError: !!jerseysError 
  });

  return {
    jerseys,
    isLoading,
    jerseysError
  };
};
