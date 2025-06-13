
import { supabase } from "@/integrations/supabase/client";

export interface GameHistory {
  id?: string;
  user_id: string;
  score: number;
  correct_guesses: number;
  total_attempts: number;
  game_duration?: number;
  created_at?: string;
}

export const saveGameHistory = async (history: Omit<GameHistory, 'id' | 'created_at'>): Promise<GameHistory> => {
  const { data, error } = await supabase
    .from('user_game_history')
    .insert([history])
    .select()
    .single();

  if (error) {
    console.error('Error saving game history:', error);
    throw error;
  }

  return data;
};

export const getUserGameHistory = async (userId: string, limit: number = 10): Promise<GameHistory[]> => {
  const { data, error } = await supabase
    .from('user_game_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching game history:', error);
    throw error;
  }

  return data || [];
};

export const getUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_game_history')
    .select('score, correct_guesses, total_attempts')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      totalGames: 0,
      bestScore: 0,
      averageScore: 0,
      totalCorrectGuesses: 0,
      totalAttempts: 0,
      accuracyRate: 0
    };
  }

  const totalGames = data.length;
  const bestScore = Math.max(...data.map(game => game.score));
  const averageScore = data.reduce((sum, game) => sum + game.score, 0) / totalGames;
  const totalCorrectGuesses = data.reduce((sum, game) => sum + game.correct_guesses, 0);
  const totalAttempts = data.reduce((sum, game) => sum + game.total_attempts, 0);
  const accuracyRate = totalAttempts > 0 ? (totalCorrectGuesses / totalAttempts) * 100 : 0;

  return {
    totalGames,
    bestScore,
    averageScore: Math.round(averageScore * 100) / 100,
    totalCorrectGuesses,
    totalAttempts,
    accuracyRate: Math.round(accuracyRate * 100) / 100
  };
};
