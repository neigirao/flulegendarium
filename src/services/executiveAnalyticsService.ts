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

export interface FunnelTrend {
  date: string;
  homeViews: number;
  gameStarts: number;
  completions: number;
  rankingsSaved: number;
  conversionRate: number;
}

export const executiveAnalyticsService = {
  /**
   * Busca dados do funil de conversão completo da tabela funnel_events
   */
  async getFunnelData(days: number = 30): Promise<FunnelStage[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Buscar contagem de sessões únicas por tipo de evento
      const { data: funnelData, error } = await supabase
        .from('funnel_events')
        .select('event_type, session_id')
        .gte('created_at', periodAgo);

      if (error) {
        console.error('Erro ao buscar funnel_events:', error);
        // Fallback para dados das tabelas originais
        return this.getFunnelDataLegacy(days);
      }

      if (!funnelData || funnelData.length === 0) {
        // Se não há dados na nova tabela, usar legacy
        return this.getFunnelDataLegacy(days);
      }

      // Agrupar por tipo de evento e contar sessões únicas
      const eventCounts = new Map<string, Set<string>>();
      
      funnelData.forEach(event => {
        if (!eventCounts.has(event.event_type)) {
          eventCounts.set(event.event_type, new Set());
        }
        eventCounts.get(event.event_type)!.add(event.session_id);
      });

      const getCount = (eventType: string) => eventCounts.get(eventType)?.size || 0;

      // Etapas do funil (7 etapas completas)
      const homeViews = getCount('page_view_home');
      const modeClicks = getCount('game_mode_click');
      const gameStarts = getCount('game_started');
      const firstGuesses = getCount('first_guess');
      const gameCompletions = getCount('game_completed');
      const rankingSaves = getCount('ranking_saved');
      const shares = getCount('share_completed');

      // Usar o maior valor como base (para casos onde page_view_home não foi trackado)
      const baseCount = Math.max(homeViews, modeClicks, gameStarts, 1);

      const stages: FunnelStage[] = [
        {
          id: 'home_views',
          name: 'Visitaram a Home',
          count: homeViews || baseCount,
          percentage: 100,
          dropoffRate: 0,
          color: 'hsl(var(--primary))'
        },
        {
          id: 'mode_clicks',
          name: 'Clicaram em Modo',
          count: modeClicks,
          percentage: baseCount > 0 ? Math.round((modeClicks / baseCount) * 100) : 0,
          dropoffRate: baseCount > 0 ? Math.round(((baseCount - modeClicks) / baseCount) * 100) : 0,
          color: 'hsl(var(--chart-1))'
        },
        {
          id: 'game_starts',
          name: 'Iniciaram Jogo',
          count: gameStarts,
          percentage: baseCount > 0 ? Math.round((gameStarts / baseCount) * 100) : 0,
          dropoffRate: modeClicks > 0 ? Math.round(((modeClicks - gameStarts) / modeClicks) * 100) : 0,
          color: 'hsl(var(--chart-2))'
        },
        {
          id: 'first_guesses',
          name: 'Fizeram 1º Palpite',
          count: firstGuesses,
          percentage: baseCount > 0 ? Math.round((firstGuesses / baseCount) * 100) : 0,
          dropoffRate: gameStarts > 0 ? Math.round(((gameStarts - firstGuesses) / gameStarts) * 100) : 0,
          color: 'hsl(var(--chart-3))'
        },
        {
          id: 'completions',
          name: 'Completaram Jogo',
          count: gameCompletions,
          percentage: baseCount > 0 ? Math.round((gameCompletions / baseCount) * 100) : 0,
          dropoffRate: firstGuesses > 0 ? Math.round(((firstGuesses - gameCompletions) / firstGuesses) * 100) : 0,
          color: 'hsl(var(--chart-4))'
        },
        {
          id: 'rankings',
          name: 'Salvaram no Ranking',
          count: rankingSaves,
          percentage: baseCount > 0 ? Math.round((rankingSaves / baseCount) * 100) : 0,
          dropoffRate: gameCompletions > 0 ? Math.round(((gameCompletions - rankingSaves) / gameCompletions) * 100) : 0,
          color: 'hsl(var(--chart-5))'
        },
        {
          id: 'shares',
          name: 'Compartilharam',
          count: shares,
          percentage: baseCount > 0 ? Math.round((shares / baseCount) * 100) : 0,
          dropoffRate: rankingSaves > 0 ? Math.round(((rankingSaves - shares) / rankingSaves) * 100) : 0,
          color: 'hsl(142.1 76.2% 36.3%)' // green
        }
      ];

      return stages;
    } catch (error) {
      console.error('Erro ao buscar dados do funil:', error);
      return this.getFunnelDataLegacy(days);
    }
  },

  /**
   * Fallback para buscar dados das tabelas originais
   */
  async getFunnelDataLegacy(days: number = 30): Promise<FunnelStage[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

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
      console.error('Erro ao buscar dados do funil (legacy):', error);
      return [];
    }
  },

  /**
   * Busca tendência do funil ao longo do tempo
   */
  async getFunnelTrend(days: number = 30): Promise<FunnelTrend[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('funnel_events')
        .select('event_type, session_id, created_at')
        .gte('created_at', periodAgo);

      if (error || !data || data.length === 0) {
        return [];
      }

      // Agrupar por data
      const dailyData = new Map<string, {
        homeViews: Set<string>;
        gameStarts: Set<string>;
        completions: Set<string>;
        rankingsSaved: Set<string>;
      }>();

      data.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        
        if (!dailyData.has(date)) {
          dailyData.set(date, {
            homeViews: new Set(),
            gameStarts: new Set(),
            completions: new Set(),
            rankingsSaved: new Set()
          });
        }

        const dayData = dailyData.get(date)!;
        
        switch (event.event_type) {
          case 'page_view_home':
            dayData.homeViews.add(event.session_id);
            break;
          case 'game_started':
            dayData.gameStarts.add(event.session_id);
            break;
          case 'game_completed':
            dayData.completions.add(event.session_id);
            break;
          case 'ranking_saved':
            dayData.rankingsSaved.add(event.session_id);
            break;
        }
      });

      // Converter para array
      const trends: FunnelTrend[] = Array.from(dailyData.entries())
        .map(([date, data]) => ({
          date,
          homeViews: data.homeViews.size,
          gameStarts: data.gameStarts.size,
          completions: data.completions.size,
          rankingsSaved: data.rankingsSaved.size,
          conversionRate: data.homeViews.size > 0 
            ? Math.round((data.rankingsSaved.size / data.homeViews.size) * 100) 
            : 0
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return trends;
    } catch (error) {
      console.error('Erro ao buscar tendência do funil:', error);
      return [];
    }
  },

  /**
   * Busca dados para o heatmap de atividade por hora/dia
   */
  async getActivityHeatmap(days: number = 30): Promise<HeatmapCell[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Tentar primeiro da tabela funnel_events
      const { data: funnelEvents, error: funnelError } = await supabase
        .from('funnel_events')
        .select('created_at')
        .gte('created_at', periodAgo);

      let allEvents: { created_at: string }[] = [];

      if (!funnelError && funnelEvents && funnelEvents.length > 0) {
        allEvents = funnelEvents;
      } else {
        // Fallback para tabelas originais
        const { data: gameStarts } = await supabase
          .from('game_starts')
          .select('created_at')
          .gte('created_at', periodAgo);

        const { data: gameSessions } = await supabase
          .from('game_sessions')
          .select('created_at')
          .gte('created_at', periodAgo);

        allEvents = [
          ...(gameStarts || []),
          ...(gameSessions || [])
        ];
      }

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
        const day = date.getDay();
        const hour = date.getHours();
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
        .gt('total_attempts', 10)
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

      const sortedByDifficulty = [...playersWithStats].sort((a, b) => a.successRate - b.successRate);

      return {
        hardest: sortedByDifficulty.slice(0, 10),
        easiest: sortedByDifficulty.slice(-10).reverse()
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
  },

  /**
   * Busca métricas de retenção (play again)
   */
  async getRetentionMetrics(days: number = 30): Promise<{
    playAgainRate: number;
    averageSessionsPerUser: number;
    returningUsers: number;
  }> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('funnel_events')
        .select('event_type, session_id, user_id')
        .gte('created_at', periodAgo);

      if (error || !data) {
        return { playAgainRate: 0, averageSessionsPerUser: 0, returningUsers: 0 };
      }

      const completions = data.filter(e => e.event_type === 'game_completed');
      const playAgains = data.filter(e => e.event_type === 'play_again');

      // Calcular taxa de jogar novamente
      const playAgainRate = completions.length > 0 
        ? Math.round((playAgains.length / completions.length) * 100) 
        : 0;

      // Calcular sessões por usuário
      const userSessions = new Map<string, Set<string>>();
      data.filter(e => e.user_id).forEach(event => {
        if (!userSessions.has(event.user_id!)) {
          userSessions.set(event.user_id!, new Set());
        }
        userSessions.get(event.user_id!)!.add(event.session_id);
      });

      const usersWithMultipleSessions = Array.from(userSessions.values()).filter(sessions => sessions.size > 1);
      const returningUsers = usersWithMultipleSessions.length;

      const totalSessions = Array.from(userSessions.values()).reduce((sum, sessions) => sum + sessions.size, 0);
      const averageSessionsPerUser = userSessions.size > 0 
        ? Math.round((totalSessions / userSessions.size) * 10) / 10 
        : 0;

      return { playAgainRate, averageSessionsPerUser, returningUsers };
    } catch (error) {
      console.error('Erro ao buscar métricas de retenção:', error);
      return { playAgainRate: 0, averageSessionsPerUser: 0, returningUsers: 0 };
    }
  }
};
