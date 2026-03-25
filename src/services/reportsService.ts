
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export interface UserEngagementData {
  date: string;
  daily_active_users: number;
  new_users: number;
  returning_users: number;
  avg_session_duration: number;
  bounce_rate: number;
  engagement_score: number;
}

export interface NPSData {
  date: string;
  promoters: number;
  passives: number;
  detractors: number;
  nps_score: number;
  total_responses: number;
}

export interface ErrorMetrics {
  date: string;
  total_errors: number;
  error_rate: number;
  top_errors: Array<{
    error_type: string;
    count: number;
    percentage: number;
  }>;
  resolved_errors: number;
  avg_resolution_time: number;
}

export interface SupportTicketData {
  date: string;
  new_tickets: number;
  resolved_tickets: number;
  pending_tickets: number;
  avg_resolution_time: number;
  satisfaction_score: number;
  priority_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface FeedbackData {
  date: string;
  total_feedback: number;
  avg_rating: number;
  positive_feedback: number;
  negative_feedback: number;
  neutral_feedback: number;
  categories: Array<{
    category: string;
    count: number;
    avg_rating: number;
  }>;
}

export const reportsService = {
  async getUserEngagementReport(days: number = 30): Promise<UserEngagementData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const { data: gameHistory, error: ghError } = await supabase
      .from('user_game_history')
      .select('user_id, created_at, game_duration')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (ghError) {
      logger.error('Erro ao buscar relatório de engajamento', 'REPORTS', { error: ghError.message });
      throw ghError;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', startDate.toISOString());

    if (!gameHistory) return [];

    // Agrupar dados por dia
    const dailyData: Record<string, UserEngagementData> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dailyData[dateStr] = {
        date: dateStr,
        daily_active_users: 0,
        new_users: 0,
        returning_users: 0,
        avg_session_duration: 0,
        bounce_rate: 0,
        engagement_score: 0
      };
    }

    // Processar dados de jogos
    const userFirstSeen: Record<string, string> = {};
    const dailyUsers: Record<string, Set<string>> = {};
    const dailySessions: Record<string, number[]> = {};

    gameHistory.forEach(game => {
      const gameDate = new Date(game.created_at).toISOString().split('T')[0];
      const userId = game.user_id;

      if (!dailyUsers[gameDate]) {
        dailyUsers[gameDate] = new Set();
        dailySessions[gameDate] = [];
      }

      dailyUsers[gameDate].add(userId);
      dailySessions[gameDate].push(game.game_duration || 180);

      if (!userFirstSeen[userId] || userFirstSeen[userId] > gameDate) {
        userFirstSeen[userId] = gameDate;
      }
    });

    // Contar novos usuários dos profiles
    profiles?.forEach(profile => {
      const profileDate = new Date(profile.created_at).toISOString().split('T')[0];
      if (dailyData[profileDate]) {
        dailyData[profileDate].new_users += 1;
      }
    });

    // Calcular métricas para cada dia
    Object.entries(dailyData).forEach(([date, data]) => {
      const users = dailyUsers[date] || new Set();
      const sessions = dailySessions[date] || [];
      
      data.daily_active_users = users.size;
      
      data.returning_users = Array.from(users).filter(userId => 
        userFirstSeen[userId] && userFirstSeen[userId] < date
      ).length;

      data.avg_session_duration = sessions.length > 0 ? 
        Math.round(sessions.reduce((sum, duration) => sum + duration, 0) / sessions.length / 60) : 0;

      const shortSessions = sessions.filter(duration => duration < 60).length;
      data.bounce_rate = sessions.length > 0 ? 
        Math.round((shortSessions / sessions.length) * 100) : 0;

      data.engagement_score = Math.min(100, Math.round(
        (data.avg_session_duration * 0.4) + 
        ((100 - data.bounce_rate) * 0.3) + 
        (data.returning_users / Math.max(1, data.daily_active_users) * 100 * 0.3)
      ));
    });

    return Object.values(dailyData);
  },

  async getNPSReport(days: number = 30): Promise<NPSData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .select('rating, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Erro ao buscar relatório NPS', 'REPORTS', { error: error.message });
      throw error;
    }

    const dailyData: Record<string, NPSData> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dailyData[dateStr] = {
        date: dateStr,
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps_score: 0,
        total_responses: 0
      };
    }

    // Processar feedback
    // NOTA: A tabela user_feedback usa escala 1-5. Conversão para NPS (0-10):
    // Rating 5 → NPS 10 (Promoter), Rating 4 → NPS 7.5 (Passive)
    // Rating 3 → NPS 5 (Detractor), Rating 1-2 → NPS 0-2.5 (Detractor)
    feedback?.forEach(f => {
      const date = new Date(f.created_at).toISOString().split('T')[0];
      if (dailyData[date]) {
        dailyData[date].total_responses += 1;
        
        // Mapeamento direto: 5=Promoter, 4=Passive, 1-3=Detractor
        if (f.rating >= 5) {
          dailyData[date].promoters += 1;
        } else if (f.rating === 4) {
          dailyData[date].passives += 1;
        } else {
          dailyData[date].detractors += 1;
        }
      }
    });

    // Calcular NPS Score
    Object.values(dailyData).forEach(data => {
      if (data.total_responses > 0) {
        const promoterPercent = (data.promoters / data.total_responses) * 100;
        const detractorPercent = (data.detractors / data.total_responses) * 100;
        data.nps_score = Math.round(promoterPercent - detractorPercent);
      }
    });

    return Object.values(dailyData);
  },

  async getErrorMetricsReport(days: number = 7): Promise<ErrorMetrics[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: bugs, error } = await supabase
      .from('bugs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) {
      logger.error('Erro ao buscar métricas de erro', 'REPORTS', { error: error.message });
      throw error;
    }

    const dailyData: Record<string, ErrorMetrics> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dailyData[dateStr] = {
        date: dateStr,
        total_errors: 0,
        error_rate: 0,
        top_errors: [],
        resolved_errors: 0,
        avg_resolution_time: 0
      };
    }

    const errorTypes: Record<string, number> = {};
    
    bugs?.forEach(bug => {
      const date = new Date(bug.created_at).toISOString().split('T')[0];
      if (dailyData[date]) {
        dailyData[date].total_errors += 1;
        
        const description = bug.description.toLowerCase();
        let errorType = 'Outros';
        
        if (description.includes('carregamento') || description.includes('loading')) {
          errorType = 'Carregamento';
        } else if (description.includes('imagem') || description.includes('image')) {
          errorType = 'Imagens';
        } else if (description.includes('login') || description.includes('auth')) {
          errorType = 'Autenticação';
        } else if (description.includes('pontuação') || description.includes('score')) {
          errorType = 'Pontuação';
        }
        
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      }
    });

    const totalErrors = Object.values(errorTypes).reduce((sum, count) => sum + count, 0);
    const topErrors = Object.entries(errorTypes)
      .map(([type, count]) => ({
        error_type: type,
        count,
        percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    Object.values(dailyData).forEach(data => {
      data.top_errors = topErrors;
      data.error_rate = data.total_errors > 0 ? Math.round((data.total_errors / Math.max(100, data.total_errors * 10)) * 100) : 0;
      data.resolved_errors = 0;
      data.avg_resolution_time = 0;
    });

    return Object.values(dailyData);
  },

  async getSupportTicketsReport(days: number = 30): Promise<SupportTicketData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) {
      logger.error('Erro ao buscar relatório de tickets', 'REPORTS', { error: error.message });
      throw error;
    }

    const dailyData: Record<string, SupportTicketData> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dailyData[dateStr] = {
        date: dateStr,
        new_tickets: 0,
        resolved_tickets: 0,
        pending_tickets: 0,
        avg_resolution_time: 0,
        satisfaction_score: 0,
        priority_breakdown: { high: 0, medium: 0, low: 0 }
      };
    }

    tickets?.forEach(ticket => {
      const date = new Date(ticket.created_at).toISOString().split('T')[0];
      if (dailyData[date]) {
        dailyData[date].new_tickets += 1;
        
        if (ticket.status === 'resolved') {
          dailyData[date].resolved_tickets += 1;
        } else {
          dailyData[date].pending_tickets += 1;
        }
        
        const priority = ticket.priority as 'high' | 'medium' | 'low';
        dailyData[date].priority_breakdown[priority] += 1;
      }
    });

    Object.values(dailyData).forEach(data => {
      const dayTickets = tickets?.filter(ticket => 
        new Date(ticket.created_at).toISOString().split('T')[0] === data.date
      ) || [];

      const resolvedDurationsHours = dayTickets
        .filter(ticket => ticket.status === 'resolved' || ticket.status === 'closed')
        .map(ticket => {
          const createdAt = new Date(ticket.created_at).getTime();
          const updatedAt = new Date(ticket.updated_at || ticket.created_at).getTime();
          const diffHours = (updatedAt - createdAt) / (1000 * 60 * 60);
          return Math.max(0, diffHours);
        });

      data.avg_resolution_time = resolvedDurationsHours.length > 0
        ? Math.round(resolvedDurationsHours.reduce((sum, duration) => sum + duration, 0) / resolvedDurationsHours.length)
        : 0;

      // Proxy determinístico de satisfação: taxa de resolução convertida para escala 0-5
      const total = data.new_tickets;
      const resolutionRate = total > 0 ? data.resolved_tickets / total : 0;
      data.satisfaction_score = Math.round(resolutionRate * 5 * 10) / 10;
    });

    return Object.values(dailyData);
  },

  async getFeedbackReport(days: number = 30): Promise<FeedbackData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) {
      logger.error('Erro ao buscar relatório de feedback', 'REPORTS', { error: error.message });
      throw error;
    }

    const dailyData: Record<string, FeedbackData> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dailyData[dateStr] = {
        date: dateStr,
        total_feedback: 0,
        avg_rating: 0,
        positive_feedback: 0,
        negative_feedback: 0,
        neutral_feedback: 0,
        categories: []
      };
    }

    const categoryRatings: Record<string, { sum: number; count: number }> = {};
    const dailyRatingTotals: Record<string, { sum: number; count: number }> = {};

    feedback?.forEach(f => {
      const date = new Date(f.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].total_feedback += 1;
          if (!dailyRatingTotals[date]) {
            dailyRatingTotals[date] = { sum: 0, count: 0 };
          }
          dailyRatingTotals[date].sum += f.rating;
          dailyRatingTotals[date].count += 1;
        
        if (f.rating >= 4) {
          dailyData[date].positive_feedback += 1;
        } else if (f.rating <= 2) {
          dailyData[date].negative_feedback += 1;
        } else {
          dailyData[date].neutral_feedback += 1;
        }
        
        const category = f.category || 'general';
        if (!categoryRatings[category]) {
          categoryRatings[category] = { sum: 0, count: 0 };
        }
        categoryRatings[category].sum += f.rating;
        categoryRatings[category].count += 1;
      }
    });

    const categories = Object.entries(categoryRatings).map(([category, data]) => ({
      category,
      count: data.count,
      avg_rating: Math.round((data.sum / data.count) * 10) / 10
    }));

    Object.values(dailyData).forEach(data => {
      const dailyRatings = dailyRatingTotals[data.date];
      if (dailyRatings && dailyRatings.count > 0) {
        data.avg_rating = Math.round((dailyRatings.sum / dailyRatings.count) * 10) / 10;
      }
      data.categories = categories;
    });

    return Object.values(dailyData);
  }
};
