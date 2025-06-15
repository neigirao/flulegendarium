
import { supabase } from "@/integrations/supabase/client";

export const useOptimizedQueries = () => {
  // Query otimizada para contagens gerais
  const getGeneralCounts = async () => {
    console.log('📊 Executando queries otimizadas para contagens gerais...');
    
    const [attemptsResult, sessionsResult, playersResult, correctResult] = await Promise.all([
      supabase.from('game_starts').select('*', { count: 'exact', head: true }),
      supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('game_attempts').select('*', { count: 'exact', head: true }).eq('is_correct', true)
    ]);
    
    return {
      totalAttempts: attemptsResult.count || 0,
      totalSessions: sessionsResult.count || 0,
      totalPlayers: playersResult.count || 0,
      correctAttempts: correctResult.count || 0
    };
  };

  // Query otimizada para estatísticas de jogadores
  const getPlayerAttempts = async () => {
    console.log('🎯 Executando query otimizada para tentativas de jogadores...');
    
    const [correctData, allAttemptsData] = await Promise.all([
      supabase
        .from('game_attempts')
        .select('target_player_name, is_correct')
        .eq('is_correct', true),
      supabase
        .from('game_attempts')
        .select('target_player_name, is_correct')
    ]);

    if (correctData.error || allAttemptsData.error) {
      throw correctData.error || allAttemptsData.error;
    }

    const totalAttempts = allAttemptsData.data?.length || 0;
    const correctAttempts = correctData.data?.length || 0;
    const successRate = totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(1) : '0';

    return {
      mostCorrectData: correctData.data || [],
      allAttemptsData: allAttemptsData.data || [],
      successRate
    };
  };

  // Query otimizada para rankings
  const getRankings = async (limit: number = 50) => {
    console.log('🏆 Executando query otimizada para rankings...');
    
    const { data, error } = await supabase
      .from('rankings')
      .select('id, player_name, score, games_played, created_at, user_id')
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  };

  // Query otimizada para progresso
  const getProgressData = async () => {
    console.log('📈 Executando query otimizada para progresso...');
    
    const { data, error } = await supabase
      .from('game_sessions')
      .select('total_correct')
      .not('total_correct', 'is', null)
      .order('total_correct');
    
    if (error) throw error;
    return data || [];
  };

  return {
    getGeneralCounts,
    getPlayerAttempts,
    getRankings,
    getProgressData
  };
};
