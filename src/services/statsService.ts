
import { supabase } from "@/integrations/supabase/client";

interface GameStats {
  totalMatches: number;
  activePlayers: number;
  highestScore: number;
  totalPlayers: number;
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

export const getGameStatsByMode = async (gameMode?: 'classic' | 'adaptive'): Promise<GameStats> => {
  try {
    const queries = [];
    
    if (gameMode) {
      queries.push(
        supabase.from('game_starts').select('*', { count: 'exact', head: true }).eq('game_mode', gameMode),
        supabase.from('rankings').select('*', { count: 'exact', head: true }).eq('game_mode', gameMode),
        supabase.from('rankings').select('score').eq('game_mode', gameMode).order('score', { ascending: false }).limit(1).single()
      );
    } else {
      queries.push(
        supabase.from('game_starts').select('*', { count: 'exact', head: true }),
        supabase.from('rankings').select('*', { count: 'exact', head: true }),
        supabase.from('rankings').select('score').order('score', { ascending: false }).limit(1).single()
      );
    }
    
    queries.push(supabase.from('players').select('*', { count: 'exact', head: true }));

    const [gameStartsResult, rankingsResult, highestScoreResult, playersResult] = await Promise.all(queries);

    return {
      totalMatches: gameStartsResult.count || 0,
      activePlayers: rankingsResult.count || 0,
      highestScore: highestScoreResult.data?.score || 0,
      totalPlayers: playersResult.count || 0
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas por modo:', error);
    return {
      totalMatches: 0,
      activePlayers: 0,
      highestScore: 0,
      totalPlayers: 0
    };
  }
};
