import { supabase } from "@/integrations/supabase/client";

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  dropoffRate: number;
  color: string;
}

export interface HeatmapCell {
  hour: number;
  day: number;
  value: number;
  dayLabel: string;
  hourLabel: string;
}

export interface PlayerDifficulty {
  id: string;
  name: string;
  position: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  avgGuessTime: number;
  difficultyLevel: string;
}

export const executiveAnalyticsService = {
  /**
   * Busca dados do funil de conversão completo
   * game_starts → game_attempts → game_sessions → rankings
   */
  async getFunnelData(days: number = 30): Promise<FunnelStage[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Buscar dados de cada etapa do funil
      const [startsRes, attemptsRes, sessionsRes, rankingsRes] = await Promise.all([
        supabase
          .from('game_starts')
          .select('id', { count: 'exact' })
          .gte('created_at', periodAgo),
        supabase
          .from('game_attempts')
          .select('id', { count: 'exact' })
          .gte('created_at', periodAgo),
        supabase
          .from('game_sessions')
          .select('id', { count: 'exact' })
          .gte('created_at', periodAgo),
        supabase
          .from('rankings')
          .select('id', { count: 'exact' })
          .gte('created_at', periodAgo)
      ]);

      const gameStarts = startsRes.count || 0;
      const gameAttempts = attemptsRes.count || 0;
      const gameSessions = sessionsRes.count || 0;
      const rankingSaves = rankingsRes.count || 0;

      // Calcular percentuais relativos ao início do funil
      const stages: FunnelStage[] = [
        {
          id: 'starts',
          name: 'Iniciaram Jogo',
          count: gameStarts,
          percentage: 100,
          dropoffRate: 0,
          color: 'hsl(var(--primary))'
        },
        {
          id: 'attempts',
          name: 'Fizeram Palpites',
          count: gameAttempts,
          percentage: gameStarts > 0 ? Math.round((Math.min(gameAttempts, gameStarts) / gameStarts) * 100) : 0,
          dropoffRate: gameStarts > 0 ? Math.round(((gameStarts - Math.min(gameAttempts, gameStarts)) / gameStarts) * 100) : 0,
          color: 'hsl(var(--chart-2))'
        },
        {
          id: 'sessions',
          name: 'Completaram Sessão',
          count: gameSessions,
          percentage: gameStarts > 0 ? Math.round((gameSessions / gameStarts) * 100) : 0,
          dropoffRate: gameAttempts > 0 ? Math.round(((Math.min(gameAttempts, gameStarts) - gameSessions) / Math.min(gameAttempts, gameStarts)) * 100) : 0,
          color: 'hsl(var(--chart-3))'
        },
        {
          id: 'rankings',
          name: 'Salvaram no Ranking',
          count: rankingSaves,
          percentage: gameStarts > 0 ? Math.round((rankingSaves / gameStarts) * 100) : 0,
          dropoffRate: gameSessions > 0 ? Math.round(((gameSessions - rankingSaves) / gameSessions) * 100) : 0,
          color: 'hsl(var(--chart-4))'
        }
      ];

      return stages;
    } catch (error) {
      console.error('Erro ao buscar dados do funil:', error);
      return [];
    }
  },

  /**
   * Busca dados para o heatmap de atividade por hora/dia
   */
  async getActivityHeatmap(days: number = 30): Promise<HeatmapCell[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: gameStarts } = await supabase
        .from('game_starts')
        .select('created_at')
        .gte('created_at', periodAgo);

      const { data: gameSessions } = await supabase
        .from('game_sessions')
        .select('created_at')
        .gte('created_at', periodAgo);

      // Combinar todos os eventos
      const allEvents = [
        ...(gameStarts || []),
        ...(gameSessions || [])
      ];

      // Dias da semana em português
      const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

      // Inicializar matriz 7 dias x 24 horas
      const heatmapMatrix: Record<string, number> = {};
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmapMatrix[`${day}-${hour}`] = 0;
        }
      }

      // Contar eventos por dia/hora
      allEvents.forEach(event => {
        const date = new Date(event.created_at);
        const day = date.getDay(); // 0-6
        const hour = date.getHours(); // 0-23
        heatmapMatrix[`${day}-${hour}`] += 1;
      });

      // Converter para array de células
      const cells: HeatmapCell[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          cells.push({
            day,
            hour,
            value: heatmapMatrix[`${day}-${hour}`],
            dayLabel: dayLabels[day],
            hourLabel: `${hour.toString().padStart(2, '0')}:00`
          });
        }
      }

      return cells;
    } catch (error) {
      console.error('Erro ao buscar heatmap de atividade:', error);
      return [];
    }
  },

  /**
   * Busca jogadores mais difíceis e mais fáceis
   */
  async getPlayerDifficultyAnalysis(): Promise<{
    hardest: PlayerDifficulty[];
    easiest: PlayerDifficulty[];
  }> {
    try {
      const { data: players } = await supabase
        .from('players')
        .select('id, name, position, total_attempts, correct_attempts, average_guess_time, difficulty_level')
        .gt('total_attempts', 10) // Apenas jogadores com dados suficientes
        .order('total_attempts', { ascending: false });

      if (!players) return { hardest: [], easiest: [] };

      const playersWithStats: PlayerDifficulty[] = players.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        totalAttempts: player.total_attempts || 0,
        correctAttempts: player.correct_attempts || 0,
        successRate: player.total_attempts > 0 
          ? Math.round((player.correct_attempts || 0) / player.total_attempts * 100) 
          : 0,
        avgGuessTime: Math.round((player.average_guess_time || 30000) / 1000),
        difficultyLevel: player.difficulty_level || 'medio'
      }));

      // Ordenar por taxa de sucesso
      const sortedByDifficulty = [...playersWithStats].sort((a, b) => a.successRate - b.successRate);

      return {
        hardest: sortedByDifficulty.slice(0, 10), // 10 mais difíceis (menor success rate)
        easiest: sortedByDifficulty.slice(-10).reverse() // 10 mais fáceis (maior success rate)
      };
    } catch (error) {
      console.error('Erro ao buscar análise de dificuldade:', error);
      return { hardest: [], easiest: [] };
    }
  },

  /**
   * Busca distribuição de pontuações
   */
  async getScoreDistribution(): Promise<{ range: string; count: number }[]> {
    try {
      const { data: rankings } = await supabase
        .from('rankings')
        .select('score')
        .order('score', { ascending: true });

      if (!rankings) return [];

      // Definir faixas de pontuação
      const ranges = [
        { min: 0, max: 100, label: '0-100' },
        { min: 101, max: 300, label: '101-300' },
        { min: 301, max: 500, label: '301-500' },
        { min: 501, max: 800, label: '501-800' },
        { min: 801, max: 1000, label: '801-1000' },
        { min: 1001, max: Infinity, label: '1000+' }
      ];

      const distribution = ranges.map(range => ({
        range: range.label,
        count: rankings.filter(r => r.score >= range.min && r.score <= range.max).length
      }));

      return distribution;
    } catch (error) {
      console.error('Erro ao buscar distribuição de pontuações:', error);
      return [];
    }
  }
};
