
import { supabase } from "@/integrations/supabase/client";
import { DecadePlayer, Decade } from "@/types/decade-game";
import { convertStatistics } from "@/utils/statistics-converter";
import { logger } from "@/utils/logger";

export const decadePlayerService = {
  async getPlayersByDecade(decade: Decade): Promise<DecadePlayer[]> {
    try {
      logger.info(`Buscando jogadores da década: ${decade}`, 'DecadePlayer');
      
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
          average_guess_time,
          decades
        `)
        .contains('decades', [decade]);
      
      if (error) {
        logger.error(`Erro ao buscar jogadores da década ${decade}`, 'DecadePlayer', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        logger.warn(`Nenhum jogador encontrado para a década ${decade}`, 'DecadePlayer');
        return [];
      }

      logger.info(`Encontrados ${data.length} jogadores da década ${decade}`, 'DecadePlayer');
      
      return data.map(player => ({
        id: player.id,
        name: player.name || 'Nome não informado',
        position: player.position || 'Posição não informada',
        image_url: player.image_url || '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
        year_highlight: player.year_highlight || '',
        fun_fact: player.fun_fact || '',
        achievements: Array.isArray(player.achievements) ? player.achievements : [],
        nicknames: Array.isArray(player.nicknames) ? player.nicknames : [],
        statistics: convertStatistics(player.statistics),
        difficulty_level: (player.difficulty_level as DecadePlayer['difficulty_level']) || 'medio',
        difficulty_score: player.difficulty_score || 50,
        difficulty_confidence: player.difficulty_confidence || 0,
        total_attempts: player.total_attempts || 0,
        correct_attempts: player.correct_attempts || 0,
        average_guess_time: player.average_guess_time || 30000,
        decades: Array.isArray(player.decades) ? player.decades as Decade[] : []
      }));

    } catch (error) {
      logger.error('Exceção ao buscar jogadores por década', 'DecadePlayer', error);
      throw error;
    }
  },

  async getAvailableDecades(): Promise<Decade[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('decades')
        .not('decades', 'is', null);
      
      if (error) throw error;
      
      const allDecades = data?.flatMap(p => p.decades || []).filter(Boolean);
      const decades = [...new Set(allDecades)];
      return decades.sort() as Decade[];
    } catch (error) {
      logger.error('Erro ao buscar décadas disponíveis', 'DecadePlayer', error);
      return [];
    }
  }
};
