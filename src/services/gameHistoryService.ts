
import { supabase } from "@/integrations/supabase/client";

export interface GameHistory {
  id?: string;
  user_id: string;
  score: number;
  correct_guesses: number;
  total_attempts: number;
  game_duration?: number;
  current_streak?: number;
  max_streak?: number;
  created_at?: string;
}

export const saveGameHistory = async (history: Omit<GameHistory, 'id' | 'created_at'>): Promise<GameHistory> => {
  console.log('💾 GameHistoryService: Attempting to save history:', history);
  
  try {
    const { data, error } = await supabase
      .from('user_game_history')
      .insert([history])
      .select()
      .single();

    if (error) {
      console.error('❌ GameHistoryService: Error saving game history:', error);
      throw error;
    }

    console.log('✅ GameHistoryService: Game history saved successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ GameHistoryService: Exception while saving:', error);
    throw error;
  }
};

export const getUserGameHistory = async (userId: string, limit: number = 10): Promise<GameHistory[]> => {
  console.log('📖 GameHistoryService: Fetching history for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('user_game_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ GameHistoryService: Error fetching game history:', error);
      throw error;
    }

    console.log('✅ GameHistoryService: Fetched history:', data?.length || 0, 'records');
    return data || [];
  } catch (error) {
    console.error('❌ GameHistoryService: Exception while fetching:', error);
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  console.log('📊 GameHistoryService: Calculating stats for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('user_game_history')
      .select('score, correct_guesses, total_attempts, current_streak, max_streak')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ GameHistoryService: Error fetching user stats:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ GameHistoryService: No data found for user:', userId);
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        totalCorrectGuesses: 0,
        totalAttempts: 0,
        accuracyRate: 0,
        maxStreak: 0
      };
    }

    const totalGames = data.length;
    const bestScore = Math.max(...data.map(game => game.score));
    const averageScore = data.reduce((sum, game) => sum + game.score, 0) / totalGames;
    const totalCorrectGuesses = data.reduce((sum, game) => sum + game.correct_guesses, 0);
    const totalAttempts = data.reduce((sum, game) => sum + game.total_attempts, 0);
    const accuracyRate = totalAttempts > 0 ? (totalCorrectGuesses / totalAttempts) * 100 : 0;
    const maxStreak = Math.max(...data.map(game => game.max_streak || 0));

    const stats = {
      totalGames,
      bestScore,
      averageScore: Math.round(averageScore * 100) / 100,
      totalCorrectGuesses,
      totalAttempts,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      maxStreak
    };

    console.log('✅ GameHistoryService: Calculated stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ GameHistoryService: Exception while calculating stats:', error);
    throw error;
  }
};
