
import { supabase } from "@/integrations/supabase/client";

export interface TimeSeriesData {
  date: string;
  score: number;
  accuracy: number;
  games_played: number;
}

export interface PlayerInsight {
  type: 'strength' | 'weakness' | 'improvement' | 'pattern';
  title: string;
  description: string;
  metric: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SocialComparison {
  user_rank: number;
  total_users: number;
  percentile: number;
  score_vs_average: number;
  accuracy_vs_average: number;
}

export interface PerformancePattern {
  best_hour: number;
  best_day: string;
  peak_accuracy_time: string;
  consistency_score: number;
  learning_rate: number;
}

export const advancedAnalyticsService = {
  // Análise temporal de performance
  async getTimeSeriesData(userId: string, days: number = 30): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('user_game_history')
      .select('score, correct_guesses, total_attempts, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Agrupar por dia
    const groupedByDay = data?.reduce((acc, game) => {
      const date = new Date(game.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = {
          total_score: 0,
          total_correct: 0,
          total_attempts: 0,
          games_count: 0
        };
      }
      acc[date].total_score += game.score;
      acc[date].total_correct += game.correct_guesses;
      acc[date].total_attempts += game.total_attempts;
      acc[date].games_count += 1;
      return acc;
    }, {} as Record<string, any>) || {};

    return Object.entries(groupedByDay).map(([date, stats]: [string, any]) => ({
      date: new Date(date).toISOString().split('T')[0],
      score: Math.round(stats.total_score / stats.games_count),
      accuracy: stats.total_attempts > 0 ? Math.round((stats.total_correct / stats.total_attempts) * 100) : 0,
      games_played: stats.games_count
    }));
  },

  // Comparação social
  async getSocialComparison(userId: string): Promise<SocialComparison> {
    // Buscar estatísticas do usuário
    const { data: userStats, error: userError } = await supabase
      .from('user_game_history')
      .select('score, correct_guesses, total_attempts')
      .eq('user_id', userId);

    if (userError) throw userError;

    // Buscar todas as estatísticas para comparação
    const { data: allStats, error: allError } = await supabase
      .from('user_game_history')
      .select('user_id, score, correct_guesses, total_attempts')
      .not('user_id', 'is', null);

    if (allError) throw allError;

    if (!userStats || !allStats) {
      return {
        user_rank: 0,
        total_users: 0,
        percentile: 0,
        score_vs_average: 0,
        accuracy_vs_average: 0
      };
    }

    // Calcular médias do usuário
    const userAvgScore = userStats.reduce((sum, game) => sum + game.score, 0) / userStats.length;
    const userTotalCorrect = userStats.reduce((sum, game) => sum + game.correct_guesses, 0);
    const userTotalAttempts = userStats.reduce((sum, game) => sum + game.total_attempts, 0);
    const userAccuracy = userTotalAttempts > 0 ? (userTotalCorrect / userTotalAttempts) * 100 : 0;

    // Agrupar por usuário
    const userGroups = allStats.reduce((acc, game) => {
      if (!acc[game.user_id]) {
        acc[game.user_id] = { scores: [], correct: 0, attempts: 0 };
      }
      acc[game.user_id].scores.push(game.score);
      acc[game.user_id].correct += game.correct_guesses;
      acc[game.user_id].attempts += game.total_attempts;
      return acc;
    }, {} as Record<string, any>);

    // Calcular médias globais e ranking
    const userAverages = Object.entries(userGroups).map(([uid, stats]: [string, any]) => ({
      user_id: uid,
      avg_score: stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length,
      accuracy: stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0
    }));

    const sortedByScore = userAverages.sort((a, b) => b.avg_score - a.avg_score);
    const userRank = sortedByScore.findIndex(u => u.user_id === userId) + 1;
    
    const globalAvgScore = userAverages.reduce((sum, user) => sum + user.avg_score, 0) / userAverages.length;
    const globalAvgAccuracy = userAverages.reduce((sum, user) => sum + user.accuracy, 0) / userAverages.length;

    return {
      user_rank: userRank,
      total_users: userAverages.length,
      percentile: Math.round(((userAverages.length - userRank + 1)  / userAverages.length) * 100),
      score_vs_average: Math.round(((userAvgScore - globalAvgScore) / globalAvgScore) * 100),
      accuracy_vs_average: Math.round(userAccuracy - globalAvgAccuracy)
    };
  },

  // Insights automáticos
  async generateInsights(userId: string): Promise<PlayerInsight[]> {
    const timeSeriesData = await this.getTimeSeriesData(userId, 30);
    const socialComparison = await this.getSocialComparison(userId);
    
    const insights: PlayerInsight[] = [];

    if (timeSeriesData.length >= 7) {
      // Análise de tendência
      const recentScores = timeSeriesData.slice(-7).map(d => d.score);
      const olderScores = timeSeriesData.slice(-14, -7).map(d => d.score);
      
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : recentAvg;
      
      if (recentAvg > olderAvg * 1.1) {
        insights.push({
          type: 'improvement',
          title: 'Performance em Alta! 📈',
          description: `Sua pontuação média aumentou ${Math.round(((recentAvg - olderAvg) / olderAvg) * 100)}% nos últimos 7 dias.`,
          metric: Math.round(((recentAvg - olderAvg) / olderAvg) * 100),
          trend: 'up'
        });
      }

      // Análise de consistência
      const scoreVariance = recentScores.reduce((acc, score) => acc + Math.pow(score - recentAvg, 2), 0) / recentScores.length;
      const consistencyScore = Math.max(0, 100 - Math.sqrt(scoreVariance));
      
      if (consistencyScore > 80) {
        insights.push({
          type: 'strength',
          title: 'Jogador Consistente! 🎯',
          description: `Você mantém uma performance estável com ${Math.round(consistencyScore)}% de consistência.`,
          metric: Math.round(consistencyScore),
          trend: 'stable'
        });
      }
    }

    // Insights sociais
    if (socialComparison.percentile >= 80) {
      insights.push({
        type: 'strength',
        title: 'Top Player! 🏆',
        description: `Você está no top ${100 - socialComparison.percentile}% dos jogadores!`,
        metric: socialComparison.percentile,
        trend: 'up'
      });
    }

    if (socialComparison.score_vs_average > 20) {
      insights.push({
        type: 'strength',
        title: 'Acima da Média! ⭐',
        description: `Sua pontuação é ${socialComparison.score_vs_average}% maior que a média geral.`,
        metric: socialComparison.score_vs_average,
        trend: 'up'
      });
    }

    return insights;
  },

  // Padrões de performance
  async getPerformancePatterns(userId: string): Promise<PerformancePattern> {
    const { data, error } = await supabase
      .from('user_game_history')
      .select('score, correct_guesses, total_attempts, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        best_hour: 20,
        best_day: 'Sunday',
        peak_accuracy_time: '20:00',
        consistency_score: 0,
        learning_rate: 0
      };
    }

    // Análise por hora
    const hourlyStats = data.reduce((acc, game) => {
      const hour = new Date(game.created_at).getHours();
      if (!acc[hour]) acc[hour] = { scores: [], total: 0 };
      acc[hour].scores.push(game.score);
      acc[hour].total += 1;
      return acc;
    }, {} as Record<number, any>);

    const bestHour = Object.entries(hourlyStats)
      .sort(([,a], [,b]) => (b.scores.reduce((x: number, y: number) => x + y, 0) / b.scores.length) - 
                            (a.scores.reduce((x: number, y: number) => x + y, 0) / a.scores.length))
      [0]?.[0] || '20';

    // Análise por dia da semana
    const dailyStats = data.reduce((acc, game) => {
      const day = new Date(game.created_at).toLocaleDateString('en-US', { weekday: 'long' });
      if (!acc[day]) acc[day] = { scores: [] };
      acc[day].scores.push(game.score);
      return acc;
    }, {} as Record<string, any>);

    const bestDay = Object.entries(dailyStats)
      .sort(([,a], [,b]) => (b.scores.reduce((x: number, y: number) => x + y, 0) / b.scores.length) - 
                            (a.scores.reduce((x: number, y: number) => x + y, 0) / a.scores.length))
      [0]?.[0] || 'Sunday';

    // Calcular taxa de aprendizado
    const sortedGames = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const firstHalf = sortedGames.slice(0, Math.floor(sortedGames.length / 2));
    const secondHalf = sortedGames.slice(Math.floor(sortedGames.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, game) => sum + game.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, game) => sum + game.score, 0) / secondHalf.length;
    const learningRate = firstHalf.length > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    // Calcular consistência baseada na variância dos scores
    const allScores = data.map(game => game.score);
    const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length;
    const consistencyScore = Math.max(0, Math.min(100, 100 - (Math.sqrt(variance) / avgScore) * 100));

    return {
      best_hour: parseInt(bestHour),
      best_day: bestDay,
      peak_accuracy_time: `${bestHour}:00`,
      consistency_score: Math.round(consistencyScore),
      learning_rate: Math.round(Math.max(0, learningRate))
    };
  }
};
