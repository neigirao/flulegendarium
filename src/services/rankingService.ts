import { supabase } from "@/integrations/supabase/client";

export interface Ranking {
  id?: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id?: string | null;
  created_at?: string;
}

export const saveRanking = async (ranking: Omit<Ranking, 'id' | 'created_at'>): Promise<Ranking> => {
  console.log('💾 Salvando ranking:', ranking);
  
  const { data, error } = await supabase
    .from('rankings')
    .insert([ranking])
    .select()
    .single();

  if (error) {
    console.error('❌ Error saving ranking:', error);
    throw error;
  }

  console.log('✅ Ranking salvo com sucesso:', data);

  // Invalidate all ranking queries to trigger refresh
  // This will be handled by the components using staleTime
  
  return data;
};

export const getTopRankings = async (limit: number = 10, gameMode?: 'classic' | 'adaptive'): Promise<Ranking[]> => {
  console.log('🏆 Buscando top rankings, limit:', limit, 'gameMode:', gameMode);
  
  let query = supabase
    .from('rankings')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (gameMode) {
    query = query.eq('game_mode', gameMode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching rankings:', error);
    throw error;
  }

  console.log('✅ Top rankings carregados:', data?.length || 0);
  return data || [];
};

export const getUserRankings = async (userId: string, limit: number = 10, gameMode?: 'classic' | 'adaptive'): Promise<Ranking[]> => {
  console.log('👤 Buscando rankings do usuário:', userId, 'gameMode:', gameMode);
  
  let query = supabase
    .from('rankings')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(limit);

  if (gameMode) {
    query = query.eq('game_mode', gameMode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching user rankings:', error);
    throw error;
  }

  console.log('✅ Rankings do usuário carregados:', data?.length || 0);
  return data || [];
};

export const getAllRankings = async (): Promise<Ranking[]> => {
  console.log('📊 Buscando todos os rankings para admin...');
  
  const { data, error } = await supabase
    .from('rankings')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    console.error('❌ Error fetching all rankings:', error);
    throw error;
  }

  console.log('✅ Todos os rankings carregados:', data?.length || 0);
  return data || [];
};
