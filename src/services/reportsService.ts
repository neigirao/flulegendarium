
import { supabase } from "@/integrations/supabase/client";

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
  response_rate: number;
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
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data: gameHistory } = await supabase
        .from('user_game_history')
        .select('user_id, created_at, game_duration')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

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
        
        // Usuários retornando (não é o primeiro dia que aparecem)
        data.returning_users = Array.from(users).filter(userId => 
          userFirstSeen[userId] && userFirstSeen[userId] < date
        ).length;

        // Duração média da sessão
        data.avg_session_duration = sessions.length > 0 ? 
          Math.round(sessions.reduce((sum, duration) => sum + duration, 0) / sessions.length / 60) : 0;

        // Taxa de rejeição (usuários com apenas 1 sessão muito curta)
        const shortSessions = sessions.filter(duration => duration < 60).length;
        data.bounce_rate = sessions.length > 0 ? 
          Math.round((shortSessions / sessions.length) * 100) : 0;

        // Score de engajamento
        data.engagement_score = Math.min(100, Math.round(
          (data.avg_session_duration * 0.4) + 
          ((100 - data.bounce_rate) * 0.3) + 
          (data.returning_users / Math.max(1, data.daily_active_users) * 100 * 0.3)
        ));
      });

      return Object.values(dailyData);

    } catch (error) {
      console.error('Erro ao buscar relatório de engajamento:', error);
      return [];
    }
  },

  async getNPSReport(days: number = 30): Promise<NPSData[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: feedback } = await supabase
        .from('user_feedback')
        .select('rating, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      const dailyData: Record<string, NPSData> = {};

      // Inicializar dados diários
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
          total_responses: 0,
          response_rate: 0
        };
      }

      // Processar feedback
      feedback?.forEach(f => {
        const date = new Date(f.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].total_responses += 1;
          
          // Converter rating (1-5) para NPS (0-10)
          const npsRating = Math.round((f.rating - 1) * 2.25);
          
          if (npsRating >= 9) {
            dailyData[date].promoters += 1;
          } else if (npsRating >= 7) {
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
          data.response_rate = Math.round((data.total_responses / Math.max(10, data.total_responses * 2)) * 100);
        }
      });

      return Object.values(dailyData);

    } catch (error) {
      console.error('Erro ao buscar relatório NPS:', error);
      return [];
    }
  },

  async getErrorMetricsReport(days: number = 7): Promise<ErrorMetrics[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: bugs } = await supabase
        .from('bugs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const dailyData: Record<string, ErrorMetrics> = {};

      // Inicializar dados diários
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

      // Processar bugs/erros
      const errorTypes: Record<string, number> = {};
      
      bugs?.forEach(bug => {
        const date = new Date(bug.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].total_errors += 1;
          
          // Categorizar erros por palavras-chave na descrição
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

      // Calcular top errors e métricas
      const totalErrors = Object.values(errorTypes).reduce((sum, count) => sum + count, 0);
      const topErrors = Object.entries(errorTypes)
        .map(([type, count]) => ({
          error_type: type,
          count,
          percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Distribuir métricas pelos dias
      Object.values(dailyData).forEach(data => {
        data.top_errors = topErrors;
        data.error_rate = data.total_errors > 0 ? Math.round((data.total_errors / Math.max(100, data.total_errors * 10)) * 100) : 0;
        // A tabela "bugs" não possui status/resolução; manter determinístico e explícito
        data.resolved_errors = 0;
        data.avg_resolution_time = 0;
      });

      return Object.values(dailyData);

    } catch (error) {
      console.error('Erro ao buscar métricas de erro:', error);
      return [];
    }
  },

  async getSupportTicketsReport(days: number = 30): Promise<SupportTicketData[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const dailyData: Record<string, SupportTicketData> = {};

      // Inicializar dados diários
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

      // Processar tickets
      tickets?.forEach(ticket => {
        const date = new Date(ticket.created_at).toISOString().split('T')[0];
        if (dailyData[date]) {
          dailyData[date].new_tickets += 1;
          
          if (ticket.status === 'resolved') {
            dailyData[date].resolved_tickets += 1;
          } else {
            dailyData[date].pending_tickets += 1;
          }
          
          // Contabilizar prioridade
          const priority = ticket.priority as 'high' | 'medium' | 'low';
          dailyData[date].priority_breakdown[priority] += 1;
        }
      });

      // Calcular métricas adicionais
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

    } catch (error) {
      console.error('Erro ao buscar relatório de tickets:', error);
      return [];
    }
  },

  async getFeedbackReport(days: number = 30): Promise<FeedbackData[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: feedback } = await supabase
        .from('user_feedback')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const dailyData: Record<string, FeedbackData> = {};

      // Inicializar dados diários
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

      // Processar feedback
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
          
          // Agrupar por categoria
          const category = f.category || 'general';
          if (!categoryRatings[category]) {
            categoryRatings[category] = { sum: 0, count: 0 };
          }
          categoryRatings[category].sum += f.rating;
          categoryRatings[category].count += 1;
        }
      });

      // Calcular categorias e médias
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

    } catch (error) {
      console.error('Erro ao buscar relatório de feedback:', error);
      return [];
    }
  }
};
