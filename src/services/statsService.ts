
import { supabase } from "@/lib/supabase";

interface GameStats {
  totalMatches: number;
  activePlayers: number;
  highestScore: number;
  totalPlayers: number;
}

export const getGameStats = async (): Promise<GameStats> => {
  try {
    // Get total game sessions
    const { count: totalMatches } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true });

    // Get unique active players (players who have rankings)
    const { count: activePlayers } = await supabase
      .from('rankings')
      .select('*', { count: 'exact', head: true });

    // Get highest score from rankings
    const { data: highestScoreData } = await supabase
      .from('rankings')
      .select('score')
      .order('score', { ascending: false })
      .limit(1)
      .single();

    // Get total number of players in database
    const { count: totalPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    return {
      totalMatches: totalMatches || 0,
      activePlayers: activePlayers || 0,
      highestScore: highestScoreData?.score || 0,
      totalPlayers: totalPlayers || 0
    };
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
