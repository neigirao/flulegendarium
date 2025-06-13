
import { supabase } from "@/lib/supabase";

export interface Ranking {
  id?: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id?: string | null;
  created_at?: string;
}

export const saveRanking = async (ranking: Omit<Ranking, 'id' | 'created_at'>): Promise<Ranking> => {
  const { data, error } = await supabase
    .from('rankings')
    .insert([ranking])
    .select()
    .single();

  if (error) {
    console.error('Error saving ranking:', error);
    throw error;
  }

  return data;
};

export const getTopRankings = async (limit: number = 10): Promise<Ranking[]> => {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching rankings:', error);
    throw error;
  }

  return data || [];
};

export const getUserRankings = async (userId: string, limit: number = 10): Promise<Ranking[]> => {
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user rankings:', error);
    throw error;
  }

  return data || [];
};
