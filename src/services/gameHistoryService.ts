
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

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
  game_mode?: 'classic' | 'adaptive';
  difficulty_level?: string;
  difficulty_multiplier?: number;
}

export const saveGameHistory = async (history: Omit<GameHistory, 'id' | 'created_at'>): Promise<GameHistory> => {
  logger.debug('Attempting to save history', 'GameHistoryService', history);
  
  try {
    const { data, error } = await supabase
      .from('user_game_history')
      .insert([history])
      .select()
      .single();

    if (error) {
      logger.error('Error saving game history', 'GameHistoryService', error);
      throw error;
    }

    logger.debug('Game history saved successfully', 'GameHistoryService', data);
    return data as GameHistory;
  } catch (error) {
    logger.error('Exception while saving', 'GameHistoryService', error);
    throw error;
  }
};

export const getUserGameHistory = async (userId: string, limit: number = 10, gameMode?: 'classic' | 'adaptive'): Promise<GameHistory[]> => {
  logger.debug('Fetching history for user', 'GameHistoryService', { userId, gameMode });
  
  try {
    let query = supabase
      .from('user_game_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (gameMode) {
      query = query.eq('game_mode', gameMode);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching game history', 'GameHistoryService', error);
      throw error;
    }

    logger.debug('Fetched history', 'GameHistoryService', { count: data?.length || 0 });
    return (data || []) as GameHistory[];
  } catch (error) {
    logger.error('Exception while fetching', 'GameHistoryService', error);
    throw error;
  }
};

export const getUserStats = async (userId: string, gameMode?: 'classic' | 'adaptive') => {
  logger.debug('Calculating stats for user', 'GameHistoryService', { userId, gameMode });
  
  try {
    let query = supabase
      .from('user_game_history')
      .select('score, correct_guesses, total_attempts, current_streak, max_streak, game_mode, difficulty_level')
      .eq('user_id', userId);

    if (gameMode) {
      query = query.eq('game_mode', gameMode);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching user stats', 'GameHistoryService', error);
      throw error;
    }

    if (!data || data.length === 0) {
      logger.debug('No data found for user', 'GameHistoryService', { userId });
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        totalCorrectGuesses: 0,
        totalAttempts: 0,
        accuracyRate: 0,
        maxStreak: 0,
        adaptiveGames: 0,
        classicGames: 0
      };
    }

    const totalGames = data.length;
    const bestScore = Math.max(...data.map(game => game.score));
    const averageScore = data.reduce((sum, game) => sum + game.score, 0) / totalGames;
    const totalCorrectGuesses = data.reduce((sum, game) => sum + game.correct_guesses, 0);
    const totalAttempts = data.reduce((sum, game) => sum + game.total_attempts, 0);
    const accuracyRate = totalAttempts > 0 ? (totalCorrectGuesses / totalAttempts) * 100 : 0;
    const maxStreak = Math.max(...data.map(game => game.max_streak || 0));
    
    const adaptiveGames = data.filter(game => game.game_mode === 'adaptive').length;
    const classicGames = data.filter(game => game.game_mode === 'classic' || !game.game_mode).length;

    const stats = {
      totalGames,
      bestScore,
      averageScore: Math.round(averageScore * 100) / 100,
      totalCorrectGuesses,
      totalAttempts,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      maxStreak,
      adaptiveGames,
      classicGames
    };

    logger.debug('Calculated stats', 'GameHistoryService', stats);
    return stats;
  } catch (error) {
    logger.error('Exception while calculating stats', 'GameHistoryService', error);
    throw error;
  }
};
