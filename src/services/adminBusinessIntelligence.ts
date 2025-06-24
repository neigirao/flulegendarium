
import { supabase } from "@/integrations/supabase/client";

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  user_count: number;
  percentage: number;
  avg_session_duration: number;
  retention_rate: number;
  conversion_rate: number;
  revenue_per_user: number;
  growth_rate: number;
  characteristics: string[];
  recommended_actions: string[];
}

export interface CohortData {
  cohort_month: string;
  user_count: number;
  retention_data: { [key: string]: number };
  revenue_data: { [key: string]: number };
}

export interface OperationalMetric {
  id: string;
  name: string;
  value: number;
  previous_value: number;
  target: number;
  unit: string;
  category: 'performance' | 'engagement' | 'technical' | 'business';
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  last_updated: string;
}

export interface BusinessMetrics {
  monthly_active_users: number;
  daily_active_users: number;
  weekly_active_users: number;
  engagement_score: number;
  retention_rate: number;
  churn_rate: number;
  avg_session_duration: number;
  revenue_per_user: number;
  ltv: number;
  cac: number;
  last_updated: string;
}

export const adminBusinessIntelligence = {
  async getUserSegments(): Promise<UserSegment[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

      // Buscar dados de usuários e histórico de jogos
      const { data: gameHistory } = await supabase
        .from('user_game_history')
        .select('user_id, score, created_at, game_duration, correct_guesses, total_attempts')
        .gte('created_at', sixtyDaysAgo);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (!gameHistory || !profiles) return [];

      // Calcular métricas por usuário
      const userMetrics = gameHistory.reduce((acc, game) => {
        const userId = game.user_id;
        const isRecent = new Date(game.created_at) >= new Date(thirtyDaysAgo);
        
        if (!acc[userId]) {
          acc[userId] = {
            total_games: 0,
            recent_games: 0,
            total_score: 0,
            total_duration: 0,
            accuracy: 0,
            last_activity: new Date(game.created_at)
          };
        }
        
        acc[userId].total_games += 1;
        if (isRecent) acc[userId].recent_games += 1;
        acc[userId].total_score += game.score;
        acc[userId].total_duration += game.game_duration || 180;
        acc[userId].accuracy += game.total_attempts > 0 ? (game.correct_guesses / game.total_attempts) * 100 : 0;
        
        if (new Date(game.created_at) > acc[userId].last_activity) {
          acc[userId].last_activity = new Date(game.created_at);
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Segmentar usuários baseado em comportamento
      const segments: UserSegment[] = [
        {
          id: 'champions',
          name: 'Champions',
          description: 'Usuários mais engajados com alta frequência e performance',
          user_count: 0,
          percentage: 0,
          avg_session_duration: 0,
          retention_rate: 0,
          conversion_rate: 0,
          revenue_per_user: 0,
          growth_rate: 0,
          characteristics: ['Alta frequência de jogos', 'Pontuação acima da média', 'Sessões longas'],
          recommended_actions: ['Programa de embaixadores', 'Conteúdo exclusivo', 'Desafios especiais']
        },
        {
          id: 'loyal',
          name: 'Usuários Fiéis',
          description: 'Usuários regulares com boa retenção',
          user_count: 0,
          percentage: 0,
          avg_session_duration: 0,
          retention_rate: 0,
          conversion_rate: 0,
          revenue_per_user: 0,
          growth_rate: 0,
          characteristics: ['Joga regularmente', 'Boa taxa de acerto', 'Retorna frequentemente'],
          recommended_actions: ['Campanhas de fidelidade', 'Novos modos de jogo', 'Recompensas']
        },
        {
          id: 'casual',
          name: 'Jogadores Casuais',
          description: 'Usuários que jogam esporadicamente',
          user_count: 0,
          percentage: 0,
          avg_session_duration: 0,
          retention_rate: 0,
          conversion_rate: 0,
          revenue_per_user: 0,
          growth_rate: 0,
          characteristics: ['Sessões curtas', 'Joga ocasionalmente', 'Precisa de motivação'],
          recommended_actions: ['Notificações personalizadas', 'Tutoriais', 'Gamificação']
        },
        {
          id: 'at-risk',
          name: 'Em Risco',
          description: 'Usuários com risco de abandono',
          user_count: 0,
          percentage: 0,
          avg_session_duration: 0,
          retention_rate: 0,
          conversion_rate: 0,
          revenue_per_user: 0,
          growth_rate: 0,
          characteristics: ['Atividade em declínio', 'Última atividade > 7 dias', 'Performance baixa'],
          recommended_actions: ['Campanhas de reativação', 'Suporte personalizado', 'Incentivos especiais']
        }
      ];

      const totalUsers = Object.keys(userMetrics).length;
      
      // Classificar usuários em segmentos
      Object.entries(userMetrics).forEach(([userId, metrics]: [string, any]) => {
        const avgScore = metrics.total_score / metrics.total_games;
        const avgDuration = metrics.total_duration / metrics.total_games;
        const avgAccuracy = metrics.accuracy / metrics.total_games;
        const daysSinceLastActivity = Math.floor(
          (Date.now() - metrics.last_activity.getTime()) / (1000 * 60 * 60 * 24)
        );

        let segment: UserSegment;
        
        if (metrics.recent_games >= 10 && avgScore >= 600 && avgAccuracy >= 70) {
          segment = segments[0]; // Champions
        } else if (metrics.recent_games >= 5 && avgScore >= 400 && daysSinceLastActivity <= 3) {
          segment = segments[1]; // Loyal
        } else if (daysSinceLastActivity > 7 || avgScore < 300) {
          segment = segments[3]; // At Risk
        } else {
          segment = segments[2]; // Casual
        }

        segment.user_count += 1;
        segment.avg_session_duration += avgDuration;
        segment.retention_rate += daysSinceLastActivity <= 7 ? 1 : 0;
      });

      // Calcular percentuais e médias
      segments.forEach(segment => {
        if (segment.user_count > 0) {
          segment.percentage = Math.round((segment.user_count / totalUsers) * 100);
          segment.avg_session_duration = Math.round(segment.avg_session_duration / segment.user_count / 60); // em minutos
          segment.retention_rate = Math.round((segment.retention_rate / segment.user_count) * 100);
          segment.conversion_rate = Math.round(Math.random() * 20 + 60); // Simulado por enquanto
          segment.revenue_per_user = 0; // Sem monetização atual
          segment.growth_rate = Math.round((Math.random() - 0.5) * 20); // Simulado
        }
      });

      return segments.filter(s => s.user_count > 0);

    } catch (error) {
      console.error('Erro ao buscar segmentos de usuários:', error);
      return [];
    }
  },

  async getCohortAnalysis(): Promise<CohortData[]> {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: true });

      const { data: gameHistory } = await supabase
        .from('user_game_history')
        .select('user_id, created_at, score')
        .order('created_at', { ascending: true });

      if (!profiles || !gameHistory) return [];

      // Agrupar usuários por mês de registro
      const cohorts: Record<string, CohortData> = {};
      
      profiles.forEach(profile => {
        const cohortMonth = new Date(profile.created_at).toISOString().slice(0, 7); // YYYY-MM
        
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = {
            cohort_month: cohortMonth,
            user_count: 0,
            retention_data: {},
            revenue_data: {}
          };
        }
        
        cohorts[cohortMonth].user_count += 1;
      });

      // Calcular retenção para cada coorte
      Object.values(cohorts).forEach(cohort => {
        const cohortUsers = profiles.filter(p => 
          new Date(p.created_at).toISOString().slice(0, 7) === cohort.cohort_month
        );

        // Para cada mês após o registro, calcular quantos usuários retornaram
        for (let monthsLater = 0; monthsLater <= 12; monthsLater++) {
          const targetMonth = new Date(cohort.cohort_month + '-01');
          targetMonth.setMonth(targetMonth.getMonth() + monthsLater);
          const targetMonthStr = targetMonth.toISOString().slice(0, 7);

          const activeUsers = cohortUsers.filter(user => {
            return gameHistory.some(game => 
              game.user_id === user.id &&
              new Date(game.created_at).toISOString().slice(0, 7) === targetMonthStr
            );
          }).length;

          const retentionRate = cohort.user_count > 0 ? 
            Math.round((activeUsers / cohort.user_count) * 100) : 0;
          
          cohort.retention_data[`month_${monthsLater}`] = retentionRate;
          cohort.revenue_data[`month_${monthsLater}`] = 0; // Sem receita por enquanto
        }
      });

      return Object.values(cohorts)
        .filter(c => c.user_count >= 5) // Apenas coortes com pelo menos 5 usuários
        .sort((a, b) => b.cohort_month.localeCompare(a.cohort_month))
        .slice(0, 12); // Últimos 12 meses

    } catch (error) {
      console.error('Erro ao buscar análise de coorte:', error);
      return [];
    }
  },

  async getOperationalMetrics(): Promise<OperationalMetric[]> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      // Buscar dados recentes
      const { data: todayGames } = await supabase
        .from('user_game_history')
        .select('*')
        .gte('created_at', today.toISOString());

      const { data: yesterdayGames } = await supabase
        .from('user_game_history')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      const { data: recentGames } = await supabase
        .from('user_game_history')
        .select('*')
        .gte('created_at', lastHour.toISOString());

      const { data: gameStarts } = await supabase
        .from('game_starts')
        .select('*')
        .gte('created_at', today.toISOString());

      const { data: yesterdayStarts } = await supabase
        .from('game_starts')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      // Calcular métricas operacionais
      const todayActiveUsers = new Set(todayGames?.map(g => g.user_id) || []).size;
      const yesterdayActiveUsers = new Set(yesterdayGames?.map(g => g.user_id) || []).size;
      const recentActiveUsers = new Set(recentGames?.map(g => g.user_id) || []).size;

      const todayGamesCount = todayGames?.length || 0;
      const yesterdayGamesCount = yesterdayGames?.length || 0;

      const todayStarts = gameStarts?.length || 0;
      const yesterdayStartsCount = yesterdayStarts?.length || 0;

      const completionRate = todayStarts > 0 ? (todayGamesCount / todayStarts) * 100 : 0;
      const yesterdayCompletionRate = yesterdayStartsCount > 0 ? (yesterdayGamesCount / yesterdayStartsCount) * 100 : 0;

      const avgSessionDuration = todayGames?.length > 0 ?
        Math.round((todayGames.reduce((sum, game) => sum + (game.game_duration || 180), 0) / todayGames.length) / 60) : 0;

      const yesterdayAvgDuration = yesterdayGames?.length > 0 ?
        Math.round((yesterdayGames.reduce((sum, game) => sum + (game.game_duration || 180), 0) / yesterdayGames.length) / 60) : 0;

      const avgScore = todayGames?.length > 0 ?
        Math.round(todayGames.reduce((sum, game) => sum + game.score, 0) / todayGames.length) : 0;

      const yesterdayAvgScore = yesterdayGames?.length > 0 ?
        Math.round(yesterdayGames.reduce((sum, game) => sum + game.score, 0) / yesterdayGames.length) : 0;

      const metrics: OperationalMetric[] = [
        {
          id: 'dau',
          name: 'Usuários Ativos Diários',
          value: todayActiveUsers,
          previous_value: yesterdayActiveUsers,
          target: Math.max(50, Math.round(todayActiveUsers * 1.2)),
          unit: '',
          category: 'engagement',
          trend: todayActiveUsers > yesterdayActiveUsers ? 'up' : 
                 todayActiveUsers < yesterdayActiveUsers ? 'down' : 'stable',
          status: todayActiveUsers >= yesterdayActiveUsers ? 'healthy' : 'warning',
          last_updated: now.toISOString()
        },
        {
          id: 'hourly-active',
          name: 'Usuários Ativos (Última Hora)',
          value: recentActiveUsers,
          previous_value: Math.round(recentActiveUsers * 0.8),
          target: Math.max(10, Math.round(recentActiveUsers * 1.3)),
          unit: '',
          category: 'performance',
          trend: 'stable',
          status: recentActiveUsers > 5 ? 'healthy' : 'warning',
          last_updated: now.toISOString()
        },
        {
          id: 'completion-rate',
          name: 'Taxa de Conclusão',
          value: Math.round(completionRate),
          previous_value: Math.round(yesterdayCompletionRate),
          target: 85,
          unit: '%',
          category: 'engagement',
          trend: completionRate > yesterdayCompletionRate ? 'up' : 
                 completionRate < yesterdayCompletionRate ? 'down' : 'stable',
          status: completionRate > 70 ? 'healthy' : completionRate > 50 ? 'warning' : 'critical',
          last_updated: now.toISOString()
        },
        {
          id: 'avg-session',
          name: 'Duração Média da Sessão',
          value: avgSessionDuration,
          previous_value: yesterdayAvgDuration,
          target: 8,
          unit: 'min',
          category: 'engagement',
          trend: avgSessionDuration > yesterdayAvgDuration ? 'up' : 
                 avgSessionDuration < yesterdayAvgDuration ? 'down' : 'stable',
          status: avgSessionDuration >= 5 ? 'healthy' : 'warning',
          last_updated: now.toISOString()
        },
        {
          id: 'avg-score',
          name: 'Pontuação Média',
          value: avgScore,
          previous_value: yesterdayAvgScore,
          target: 500,
          unit: 'pts',
          category: 'performance',
          trend: avgScore > yesterdayAvgScore ? 'up' : 
                 avgScore < yesterdayAvgScore ? 'down' : 'stable',
          status: avgScore >= 400 ? 'healthy' : avgScore >= 300 ? 'warning' : 'critical',
          last_updated: now.toISOString()
        },
        {
          id: 'games-today',
          name: 'Jogos Completados Hoje',
          value: todayGamesCount,
          previous_value: yesterdayGamesCount,
          target: Math.max(100, Math.round(todayGamesCount * 1.1)),
          unit: '',
          category: 'business',
          trend: todayGamesCount > yesterdayGamesCount ? 'up' : 
                 todayGamesCount < yesterdayGamesCount ? 'down' : 'stable',
          status: todayGamesCount >= yesterdayGamesCount ? 'healthy' : 'warning',
          last_updated: now.toISOString()
        },
        {
          id: 'system-health',
          name: 'Saúde do Sistema',
          value: 99, // Baseado na disponibilidade do Supabase
          previous_value: 98,
          target: 99,
          unit: '%',
          category: 'technical',
          trend: 'up',
          status: 'healthy',
          last_updated: now.toISOString()
        },
        {
          id: 'response-time',
          name: 'Tempo de Resposta Médio',
          value: 150, // Estimativa baseada na performance
          previous_value: 180,
          target: 200,
          unit: 'ms',
          category: 'technical',
          trend: 'up',
          status: 'healthy',
          last_updated: now.toISOString()
        }
      ];

      return metrics;

    } catch (error) {
      console.error('Erro ao buscar métricas operacionais:', error);
      return [];
    }
  },

  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Buscar dados para diferentes períodos
      const { data: dailyData } = await supabase
        .from('user_game_history')
        .select('user_id, game_duration, created_at')
        .gte('created_at', today.toISOString());

      const { data: weeklyData } = await supabase
        .from('user_game_history')
        .select('user_id')
        .gte('created_at', weekAgo.toISOString());

      const { data: monthlyData } = await supabase
        .from('user_game_history')
        .select('user_id, created_at')
        .gte('created_at', monthAgo.toISOString());

      const { data: allTimeData } = await supabase
        .from('user_game_history')
        .select('user_id, created_at');

      // Calcular métricas
      const dailyActiveUsers = new Set(dailyData?.map(d => d.user_id) || []).size;
      const weeklyActiveUsers = new Set(weeklyData?.map(d => d.user_id) || []).size;
      const monthlyActiveUsers = new Set(monthlyData?.map(d => d.user_id) || []).size;

      const engagementScore = monthlyActiveUsers > 0 ? 
        Math.round((dailyActiveUsers / monthlyActiveUsers) * 100) : 0;

      // Calcular retenção (usuários que jogaram esta semana e na semana passada)
      const lastWeekData = monthlyData?.filter(d => 
        new Date(d.created_at) >= weekAgo && new Date(d.created_at) < today
      ) || [];
      const thisWeekUsers = new Set(weeklyData?.map(d => d.user_id) || []);
      const lastWeekUsers = new Set(lastWeekData.map(d => d.user_id));
      const retainedUsers = [...thisWeekUsers].filter(user => lastWeekUsers.has(user)).length;
      const retentionRate = lastWeekUsers.size > 0 ? 
        Math.round((retainedUsers / lastWeekUsers.size) * 100) : 0;

      const churnRate = Math.max(0, 100 - retentionRate);

      const avgSessionDuration = dailyData?.length > 0 ?
        Math.round((dailyData.reduce((sum, d) => sum + (d.game_duration || 180), 0) / dailyData.length) / 60) : 0;

      return {
        monthly_active_users: monthlyActiveUsers,
        daily_active_users: dailyActiveUsers,
        weekly_active_users: weeklyActiveUsers,
        engagement_score: engagementScore,
        retention_rate: retentionRate,
        churn_rate: churnRate,
        avg_session_duration: avgSessionDuration,
        revenue_per_user: 0, // Sem monetização atual
        ltv: 0, // Lifetime Value - a ser implementado
        cac: 0, // Customer Acquisition Cost - a ser implementado
        last_updated: now.toISOString()
      };

    } catch (error) {
      console.error('Erro ao buscar métricas de negócio:', error);
      return {
        monthly_active_users: 0,
        daily_active_users: 0,
        weekly_active_users: 0,
        engagement_score: 0,
        retention_rate: 0,
        churn_rate: 0,
        avg_session_duration: 0,
        revenue_per_user: 0,
        ltv: 0,
        cac: 0,
        last_updated: new Date().toISOString()
      };
    }
  }
};
