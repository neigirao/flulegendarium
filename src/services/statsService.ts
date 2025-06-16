
import { supabase } from "@/integrations/supabase/client";

interface GameStats {
  totalMatches: number;
  activePlayers: number;
  highestScore: number;
  totalPlayers: number;
}

interface UserStatistics {
  best_streak: number;
  total_games: number;
  average_score: number;
  last_played: string;
  total_correct: number;
  total_score: number;
  current_streak: number;
  weekly_best: number;
  games_today: number;
}

// Cache for stats to avoid frequent database calls
let statsCache: { data: GameStats; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getGameStats = async (): Promise<GameStats> => {
  // Return cached data if available and not expired
  if (statsCache && Date.now() - statsCache.timestamp < CACHE_DURATION) {
    return statsCache.data;
  }

  try {
    // Batch all queries together for better performance
    const [gameStartsResult, rankingsResult, highestScoreResult, playersResult] = await Promise.all([
      supabase.from('game_starts').select('*', { count: 'exact', head: true }),
      supabase.from('rankings').select('*', { count: 'exact', head: true }),
      supabase.from('rankings').select('score').order('score', { ascending: false }).limit(1).single(),
      supabase.from('players').select('*', { count: 'exact', head: true })
    ]);

    const stats = {
      totalMatches: gameStartsResult.count || 0,
      activePlayers: rankingsResult.count || 0,
      highestScore: highestScoreResult.data?.score || 0,
      totalPlayers: playersResult.count || 0
    };

    // Update cache
    statsCache = {
      data: stats,
      timestamp: Date.now()
    };

    return stats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    // Return fallback values on error
    return {
      totalMatches: 0,
      activePlayers: 0,
      highestScore: 0,
      totalPlayers: 0
    };
  }
};

export const getUserStatistics = async (userId?: string): Promise<UserStatistics | null> => {
  if (!userId) return null;

  try {
    // Get user rankings and game history
    const { data: rankings } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!rankings || rankings.length === 0) {
      return null;
    }

    // Calculate statistics
    const scores = rankings.map(r => r.score);
    const bestStreak = Math.max(...scores);
    const totalGames = rankings.length;
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / totalGames;
    const lastPlayed = rankings[0].created_at;
    
    // For now, using simplified calculations
    // In a real implementation, you'd track these separately
    const totalCorrect = Math.floor(totalScore / 5); // Assuming 5 points per correct answer
    const currentStreak = scores[0] || 0;
    
    // Get today's games
    const today = new Date().toISOString().split('T')[0];
    const todayGames = rankings.filter(r => 
      r.created_at.startsWith(today)
    ).length;

    // Get this week's best
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyGames = rankings.filter(r => 
      new Date(r.created_at) >= weekAgo
    );
    const weeklyBest = weeklyGames.length > 0 ? Math.max(...weeklyGames.map(r => r.score)) : 0;

    return {
      best_streak: bestStreak,
      total_games: totalGames,
      average_score: averageScore,
      last_played: lastPlayed,
      total_correct: totalCorrect,
      total_score: totalScore,
      current_streak: currentStreak,
      weekly_best: weeklyBest,
      games_today: todayGames
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    return null;
  }
};
