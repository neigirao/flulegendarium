import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export interface UserSegment {
  id: string;
  segment_name: string;
  description: string;
  user_count: number;
  percentage: number;
  avg_session_duration: number;
  retention_rate: number;
  conversion_rate: number;
  growth_rate: number;
  characteristics: string[];
  recommended_actions: string[];
  avg_score: number;
  avg_accuracy: number;
}

export interface CohortData {
  cohort_period: string;
  users_acquired: number;
  retention_week_1: number;
  retention_week_2: number;
  retention_week_4: number;
  retention_week_12: number;
  avg_ltv: number;
}

export interface OperationalMetric {
  id: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  target_value: number;
  unit: string;
  category: 'performance' | 'engagement' | 'technical' | 'business';
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  change_percentage: number;
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
  last_updated: string;
}

export const adminBusinessIntelligence = {
  async getUserSegments(days: number = 30): Promise<UserSegment[]> {
    try {
      const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const extendedPeriodAgo = new Date(Date.now() - (days * 2) * 24 * 60 * 60 * 1000).toISOString();

      const { data: gameHistory } = await supabase
        .from('user_game_history')
        .select('user_id, score, created_at, game_duration, correct_guesses, total_attempts')
        .gte('created_at', extendedPeriodAgo);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (!gameHistory || !profiles) return [];

      const userMetrics = gameHistory.reduce((acc, game) => {
        const userId = game.user_id;
        const isRecent = new Date(game.created_at) >= new Date(periodAgo);
        
        if (!acc[userId]) {
          acc[userId] = {
            total_games: 0, recent_games: 0, previous_games: 0,
            total_score: 0, total_duration: 0, accuracy: 0,
            last_activity: new Date(game.created_at)
          };
        }
        
        acc[userId].total_games += 1;
        if (isRecent) { acc[userId].recent_games += 1; } else { acc[userId].previous_games += 1; }
        acc[userId].total_score += game.score;
        acc[userId].total_duration += game.game_duration || 180;
        acc[userId].accuracy += game.total_attempts > 0 ? (game.correct_guesses / game.total_attempts) * 100 : 0;
        
        if (new Date(game.created_at) > acc[userId].last_activity) {
          acc[userId].last_activity = new Date(game.created_at);
        }
        
        return acc;
      }, {} as Record<string, { total_games: number; recent_games: number; previous_games: number; total_score: number; total_duration: number; accuracy: number; last_activity: Date }>);

      const segments: UserSegment[] = [
        {
          id: 'champions', segment_name: 'Champions',
          description: 'Usuários mais engajados com alta frequência e performance',
          user_count: 0, percentage: 0, avg_session_duration: 0, retention_rate: 0,
          conversion_rate: 0, growth_rate: 0, avg_score: 0, avg_accuracy: 0,
          characteristics: ['Alta frequência de jogos', 'Pontuação acima da média', 'Sessões longas'],
          recommended_actions: ['Programa de embaixadores', 'Conteúdo exclusivo', 'Desafios especiais']
        },
        {
          id: 'loyal', segment_name: 'Usuários Fiéis',
          description: 'Usuários regulares com boa retenção',
          user_count: 0, percentage: 0, avg_session_duration: 0, retention_rate: 0,
          conversion_rate: 0, growth_rate: 0, avg_score: 0, avg_accuracy: 0,
          characteristics: ['Joga regularmente', 'Boa taxa de acerto', 'Retorna frequentemente'],
          recommended_actions: ['Campanhas de fidelidade', 'Novos modos de jogo', 'Recompensas']
        },
        {
          id: 'casual', segment_name: 'Jogadores Casuais',
          description: 'Usuários que jogam esporadicamente',
          user_count: 0, percentage: 0, avg_session_duration: 0, retention_rate: 0,
          conversion_rate: 0, growth_rate: 0, avg_score: 0, avg_accuracy: 0,
          characteristics: ['Sessões curtas', 'Joga ocasionalmente', 'Precisa de motivação'],
          recommended_actions: ['Notificações personalizadas', 'Tutoriais', 'Gamificação']
        },
        {
          id: 'at-risk', segment_name: 'Em Risco',
          description: 'Usuários com risco de abandono',
          user_count: 0, percentage: 0, avg_session_duration: 0, retention_rate: 0,
          conversion_rate: 0, growth_rate: 0, avg_score: 0, avg_accuracy: 0,
          characteristics: ['Atividade em declínio', 'Última atividade > 7 dias', 'Performance baixa'],
          recommended_actions: ['Campanhas de reativação', 'Suporte personalizado', 'Incentivos especiais']
        }
      ];

      const totalUsers = Object.keys(userMetrics).length;
      const segmentGames = segments.reduce((acc, segment) => {
        acc[segment.id] = { recent: 0, previous: 0 };
        return acc;
      }, {} as Record<string, { recent: number; previous: number }>);
      
      Object.entries(userMetrics).forEach(([_userId, metrics]) => {
        const avgScore = metrics.total_score / metrics.total_games;
        const avgDuration = metrics.total_duration / metrics.total_games;
        const avgAccuracy = metrics.accuracy / metrics.total_games;
        const daysSinceLastActivity = Math.floor(
          (Date.now() - metrics.last_activity.getTime()) / (1000 * 60 * 60 * 24)
        );

        let segment: UserSegment;
        
        if (metrics.recent_games >= 10 && avgScore >= 600 && avgAccuracy >= 70) {
          segment = segments[0];
        } else if (metrics.recent_games >= 5 && avgScore >= 400 && daysSinceLastActivity <= 3) {
          segment = segments[1];
        } else if (daysSinceLastActivity > 7 || avgScore < 300) {
          segment = segments[3];
        } else {
          segment = segments[2];
        }

        segment.user_count += 1;
        segment.avg_session_duration += avgDuration;
        segment.retention_rate += daysSinceLastActivity <= 7 ? 1 : 0;
        segment.avg_score += avgScore;
        segment.avg_accuracy += avgAccuracy;
        segmentGames[segment.id].recent += metrics.recent_games;
        segmentGames[segment.id].previous += metrics.previous_games;
      });

      segments.forEach(segment => {
        if (segment.user_count > 0) {
          segment.percentage = Math.round((segment.user_count / totalUsers) * 100);
          segment.avg_session_duration = Math.round(segment.avg_session_duration / segment.user_count / 60);
          segment.retention_rate = Math.round((segment.retention_rate / segment.user_count) * 100);
          segment.avg_score = Math.round(segment.avg_score / segment.user_count);
          segment.avg_accuracy = Math.round(segment.avg_accuracy / segment.user_count);
          segment.conversion_rate = Math.round(
            (segmentGames[segment.id].recent / Math.max(1, segment.user_count)) * 100
          );
          const previous = segmentGames[segment.id].previous;
          const current = segmentGames[segment.id].recent;
          segment.growth_rate = previous > 0
            ? Math.round(((current - previous) / previous) * 100)
            : current > 0 ? 100 : 0;
        }
      });

      return segments.filter(s => s.user_count > 0);

    } catch (error) {
      logger.error('Erro ao buscar segmentos de usuários', 'BI', { error: String(error) });
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

      // Index game history by user_id for O(1) lookup
      const gamesByUser = new Map<string, { created_at: string }[]>();
      gameHistory.forEach(game => {
        if (!gamesByUser.has(game.user_id)) {
          gamesByUser.set(game.user_id, []);
        }
        gamesByUser.get(game.user_id)!.push(game);
      });

      const cohorts: Record<string, CohortData> = {};
      
      profiles.forEach(profile => {
        const cohortMonth = new Date(profile.created_at).toISOString().slice(0, 7);
        
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = {
            cohort_period: cohortMonth,
            users_acquired: 0,
            retention_week_1: 0,
            retention_week_2: 0,
            retention_week_4: 0,
            retention_week_12: 0,
            avg_ltv: 0
          };
        }
        
        cohorts[cohortMonth].users_acquired += 1;
      });

      Object.values(cohorts).forEach(cohort => {
        const cohortUsers = profiles.filter(p => 
          new Date(p.created_at).toISOString().slice(0, 7) === cohort.cohort_period
        );

        const cohortStartDate = new Date(cohort.cohort_period + '-01');

        const checkRetention = (weekStart: Date, weekEnd: Date) => {
          return cohortUsers.filter(user => {
            const userGames = gamesByUser.get(user.id) || [];
            return userGames.some(game => {
              const gameDate = new Date(game.created_at);
              return gameDate >= weekStart && gameDate < weekEnd;
            });
          }).length;
        };
        
        const w1s = new Date(cohortStartDate);
        const w1e = new Date(cohortStartDate.getTime() + 7 * 86400000);
        cohort.retention_week_1 = cohort.users_acquired > 0 ? Math.round((checkRetention(w1s, w1e) / cohort.users_acquired) * 100) : 0;

        const w2s = new Date(cohortStartDate.getTime() + 7 * 86400000);
        const w2e = new Date(cohortStartDate.getTime() + 14 * 86400000);
        cohort.retention_week_2 = cohort.users_acquired > 0 ? Math.round((checkRetention(w2s, w2e) / cohort.users_acquired) * 100) : 0;

        const w4s = new Date(cohortStartDate.getTime() + 21 * 86400000);
        const w4e = new Date(cohortStartDate.getTime() + 28 * 86400000);
        cohort.retention_week_4 = cohort.users_acquired > 0 ? Math.round((checkRetention(w4s, w4e) / cohort.users_acquired) * 100) : 0;

        const w12s = new Date(cohortStartDate.getTime() + 77 * 86400000);
        const w12e = new Date(cohortStartDate.getTime() + 84 * 86400000);
        cohort.retention_week_12 = cohort.users_acquired > 0 ? Math.round((checkRetention(w12s, w12e) / cohort.users_acquired) * 100) : 0;

        cohort.avg_ltv = 0;
      });

      return Object.values(cohorts)
        .filter(c => c.users_acquired >= 5)
        .sort((a, b) => b.cohort_period.localeCompare(a.cohort_period))
        .slice(0, 12);

    } catch (error) {
      logger.error('Erro ao buscar análise de coorte', 'BI', { error: String(error) });
      return [];
    }
  },

  async getOperationalMetrics(): Promise<OperationalMetric[]> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const [
        { data: todayGames },
        { data: yesterdayGames },
        { data: recentGames },
        { data: previousHourGames },
        { data: gameStarts },
        { data: yesterdayStarts },
        { data: todayBugs },
        { data: pendingTickets }
      ] = await Promise.all([
        supabase.from('user_game_history').select('*').gte('created_at', today.toISOString()),
        supabase.from('user_game_history').select('*').gte('created_at', yesterday.toISOString()).lt('created_at', today.toISOString()),
        supabase.from('user_game_history').select('*').gte('created_at', lastHour.toISOString()),
        supabase.from('user_game_history').select('*').gte('created_at', twoHoursAgo.toISOString()).lt('created_at', lastHour.toISOString()),
        supabase.from('game_starts').select('*').gte('created_at', today.toISOString()),
        supabase.from('game_starts').select('*').gte('created_at', yesterday.toISOString()).lt('created_at', today.toISOString()),
        supabase.from('bugs').select('id').gte('created_at', today.toISOString()),
        supabase.from('support_tickets').select('id').in('status', ['open', 'in_progress'])
      ]);

      const todayActiveUsers = new Set(todayGames?.map(g => g.user_id) || []).size;
      const yesterdayActiveUsers = new Set(yesterdayGames?.map(g => g.user_id) || []).size;
      const recentActiveUsers = new Set(recentGames?.map(g => g.user_id) || []).size;
      const previousHourActiveUsers = new Set(previousHourGames?.map(g => g.user_id) || []).size;

      const todayGamesCount = todayGames?.length || 0;
      const yesterdayGamesCount = yesterdayGames?.length || 0;

      const todayStartsCount = gameStarts?.length || 0;
      const yesterdayStartsCount = yesterdayStarts?.length || 0;

      const completionRate = todayStartsCount > 0 ? (todayGamesCount / todayStartsCount) * 100 : 0;
      const yesterdayCompletionRate = yesterdayStartsCount > 0 ? (yesterdayGamesCount / yesterdayStartsCount) * 100 : 0;

      const avgSessionDuration = todayGames?.length ? Math.round((todayGames.reduce((sum, game) => sum + (game.game_duration || 180), 0) / todayGames.length) / 60) : 0;
      const yesterdayAvgDuration = yesterdayGames?.length ? Math.round((yesterdayGames.reduce((sum, game) => sum + (game.game_duration || 180), 0) / yesterdayGames.length) / 60) : 0;

      const avgScore = todayGames?.length ? Math.round(todayGames.reduce((sum, game) => sum + game.score, 0) / todayGames.length) : 0;
      const yesterdayAvgScore = yesterdayGames?.length ? Math.round(yesterdayGames.reduce((sum, game) => sum + game.score, 0) / yesterdayGames.length) : 0;

      const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      return [
        { id: 'dau', metric_name: 'Usuários Ativos Diários', current_value: todayActiveUsers, previous_value: yesterdayActiveUsers, target_value: Math.max(50, Math.round(todayActiveUsers * 1.2)), unit: '', category: 'engagement', trend: todayActiveUsers > yesterdayActiveUsers ? 'up' : todayActiveUsers < yesterdayActiveUsers ? 'down' : 'stable', status: todayActiveUsers >= yesterdayActiveUsers ? 'healthy' : 'warning', change_percentage: calcChange(todayActiveUsers, yesterdayActiveUsers), last_updated: now.toISOString() },
        { id: 'hourly-active', metric_name: 'Usuários Ativos (Última Hora)', current_value: recentActiveUsers, previous_value: previousHourActiveUsers, target_value: Math.max(10, Math.round(Math.max(recentActiveUsers, previousHourActiveUsers) * 1.1)), unit: '', category: 'performance', trend: recentActiveUsers > previousHourActiveUsers ? 'up' : recentActiveUsers < previousHourActiveUsers ? 'down' : 'stable', status: recentActiveUsers > 5 ? 'healthy' : 'warning', change_percentage: calcChange(recentActiveUsers, previousHourActiveUsers), last_updated: now.toISOString() },
        { id: 'completion-rate', metric_name: 'Taxa de Conclusão', current_value: Math.round(completionRate), previous_value: Math.round(yesterdayCompletionRate), target_value: 85, unit: '%', category: 'engagement', trend: completionRate > yesterdayCompletionRate ? 'up' : completionRate < yesterdayCompletionRate ? 'down' : 'stable', status: completionRate > 70 ? 'healthy' : completionRate > 50 ? 'warning' : 'critical', change_percentage: calcChange(completionRate, yesterdayCompletionRate), last_updated: now.toISOString() },
        { id: 'avg-session', metric_name: 'Duração Média da Sessão', current_value: avgSessionDuration, previous_value: yesterdayAvgDuration, target_value: 8, unit: 'min', category: 'engagement', trend: avgSessionDuration > yesterdayAvgDuration ? 'up' : avgSessionDuration < yesterdayAvgDuration ? 'down' : 'stable', status: avgSessionDuration >= 5 ? 'healthy' : 'warning', change_percentage: calcChange(avgSessionDuration, yesterdayAvgDuration), last_updated: now.toISOString() },
        { id: 'avg-score', metric_name: 'Pontuação Média', current_value: avgScore, previous_value: yesterdayAvgScore, target_value: 500, unit: 'pts', category: 'performance', trend: avgScore > yesterdayAvgScore ? 'up' : avgScore < yesterdayAvgScore ? 'down' : 'stable', status: avgScore >= 400 ? 'healthy' : avgScore >= 300 ? 'warning' : 'critical', change_percentage: calcChange(avgScore, yesterdayAvgScore), last_updated: now.toISOString() },
        { id: 'games-today', metric_name: 'Jogos Completados Hoje', current_value: todayGamesCount, previous_value: yesterdayGamesCount, target_value: Math.max(100, Math.round(todayGamesCount * 1.1)), unit: '', category: 'business', trend: todayGamesCount > yesterdayGamesCount ? 'up' : todayGamesCount < yesterdayGamesCount ? 'down' : 'stable', status: todayGamesCount >= yesterdayGamesCount ? 'healthy' : 'warning', change_percentage: calcChange(todayGamesCount, yesterdayGamesCount), last_updated: now.toISOString() },
        { id: 'bugs-today', metric_name: 'Incidentes Reportados Hoje', current_value: todayBugs?.length || 0, previous_value: 0, target_value: 0, unit: '', category: 'technical', trend: (todayBugs?.length || 0) > 0 ? 'up' : 'stable', status: (todayBugs?.length || 0) > 10 ? 'critical' : (todayBugs?.length || 0) > 3 ? 'warning' : 'healthy', change_percentage: 0, last_updated: now.toISOString() },
        { id: 'pending-support', metric_name: 'Tickets Pendentes', current_value: pendingTickets?.length || 0, previous_value: 0, target_value: 5, unit: '', category: 'technical', trend: (pendingTickets?.length || 0) > 5 ? 'up' : 'stable', status: (pendingTickets?.length || 0) > 15 ? 'critical' : (pendingTickets?.length || 0) > 5 ? 'warning' : 'healthy', change_percentage: 0, last_updated: now.toISOString() }
      ];

    } catch (error) {
      logger.error('Erro ao buscar métricas operacionais', 'BI', { error: String(error) });
      return [];
    }
  },

  async getBusinessMetrics(days: number = 30): Promise<BusinessMetrics> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const periodAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

      const [
        { data: dailyData },
        { data: weeklyData },
        { data: periodData }
      ] = await Promise.all([
        supabase.from('user_game_history').select('user_id, game_duration, created_at').gte('created_at', today.toISOString()),
        supabase.from('user_game_history').select('user_id').gte('created_at', weekAgo.toISOString()),
        supabase.from('user_game_history').select('user_id, created_at').gte('created_at', periodAgo.toISOString())
      ]);

      const dailyActiveUsers = new Set(dailyData?.map(d => d.user_id) || []).size;
      const weeklyActiveUsers = new Set(weeklyData?.map(d => d.user_id) || []).size;
      const periodActiveUsers = new Set(periodData?.map(d => d.user_id) || []).size;

      const engagementScore = periodActiveUsers > 0 ? 
        Math.round((dailyActiveUsers / periodActiveUsers) * 100) : 0;

      const lastWeekData = periodData?.filter(d =>
        new Date(d.created_at) >= weekAgo && new Date(d.created_at) < today
      ) || [];
      const thisWeekUsers = new Set(weeklyData?.map(d => d.user_id) || []);
      const lastWeekUsers = new Set(lastWeekData.map(d => d.user_id));
      const retainedUsers = [...thisWeekUsers].filter(user => lastWeekUsers.has(user)).length;
      const retentionRate = lastWeekUsers.size > 0 ? 
        Math.round((retainedUsers / lastWeekUsers.size) * 100) : 0;

      const avgSessionDuration = dailyData?.length ? Math.round((dailyData.reduce((sum, d) => sum + (d.game_duration || 180), 0) / dailyData.length) / 60) : 0;

      return {
        monthly_active_users: periodActiveUsers,
        daily_active_users: dailyActiveUsers,
        weekly_active_users: weeklyActiveUsers,
        engagement_score: engagementScore,
        retention_rate: retentionRate,
        churn_rate: Math.max(0, 100 - retentionRate),
        avg_session_duration: avgSessionDuration,
        last_updated: now.toISOString()
      };

    } catch (error) {
      logger.error('Erro ao buscar métricas de negócio', 'BI', { error: String(error) });
      return {
        monthly_active_users: 0, daily_active_users: 0, weekly_active_users: 0,
        engagement_score: 0, retention_rate: 0, churn_rate: 0,
        avg_session_duration: 0, last_updated: new Date().toISOString()
      };
    }
  }
};
