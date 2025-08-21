import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "./use-error-handler";

interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

export const useOptimizedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config: QueryConfig = {}
) => {
  const { handleError } = useErrorHandler({ logToConsole: false });
  
  return useQuery({
    queryKey,
    queryFn,
    staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutos default
    gcTime: config.cacheTime || 10 * 60 * 1000, // 10 minutos default
    refetchOnWindowFocus: config.refetchOnWindowFocus ?? false,
    retry: config.retry ?? 1,
    onError: (error: Error) => {
      handleError(error, `Query: ${queryKey.join('/')}`);
    }
  } as UseQueryOptions<T, Error>);
};

// Queries otimizadas específicas
// Enhanced game stats with more comprehensive data
export const useGameStats = () => {
  return useOptimizedQuery(
    ['game-stats-comprehensive'],
    async () => {
      const [sessionsResponse, attemptsResponse, playersResponse, correctAttemptsResponse] = await Promise.all([
        supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('game_attempts').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('game_attempts').select('id', { count: 'exact', head: true }).eq('is_correct', true)
      ]);
      
      return {
        totalGames: sessionsResponse.count || 0,
        totalAttempts: attemptsResponse.count || 0,
        totalPlayers: playersResponse.count || 0,
        correctAttempts: correctAttemptsResponse.count || 0,
        accuracyRate: (attemptsResponse.count || 0) > 0 ? 
          Math.round(((correctAttemptsResponse.count || 0) / (attemptsResponse.count || 0)) * 100) : 0
      };
    },
    { staleTime: 10 * 60 * 1000 }
  );
};

// Player ranking with pagination and caching (simplified)
export const usePlayerRanking = (page: number = 1, limit: number = 10) => {
  return useOptimizedQuery(
    ['player-ranking', page.toString(), limit.toString()],
    async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          player_name,
          total_correct,
          total_attempts,
          max_streak,
          created_at
        `)
        .order('total_correct', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      
      // Get total count for pagination
      const { count } = await supabase
        .from('game_sessions')
        .select('id', { count: 'exact', head: true });
      
      return {
        rankings: data || [],
        totalPlayers: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    { staleTime: 5 * 60 * 1000 }
  );
};

// User game history with performance metrics (simplified for current schema)
export const useUserGameHistory = () => {
  return useOptimizedQuery(
    ['user-game-history'],
    async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          id,
          player_name,
          total_attempts,
          total_correct,
          max_streak,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Calculate performance metrics
      const sessions = data || [];
      const totalSessions = sessions.length;
      const totalAttempts = sessions.reduce((sum, s) => sum + (s.total_attempts || 0), 0);
      const totalCorrect = sessions.reduce((sum, s) => sum + (s.total_correct || 0), 0);
      const bestStreak = Math.max(...sessions.map(s => s.max_streak || 0), 0);
      
      return {
        sessions,
        stats: {
          totalSessions,
          totalAttempts,
          totalCorrect,
          accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
          bestStreak,
          averageCorrect: totalSessions > 0 ? Math.round(totalCorrect / totalSessions) : 0,
          gamesThisWeek: sessions.filter(s => {
            const sessionDate = new Date(s.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
          }).length
        }
      };
    },
    { staleTime: 2 * 60 * 1000 }
  );
};

// Achievement statistics (simplified for current schema)
export const useAchievementStats = () => {
  return useOptimizedQuery(
    ['achievement-stats'],
    async () => {
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select(`
          total_attempts,
          total_correct,
          max_streak,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      const sessionData = sessions || [];
      
      return {
        totalGames: sessionData.length,
        totalAttempts: sessionData.reduce((sum, s) => sum + (s.total_attempts || 0), 0),
        totalCorrect: sessionData.reduce((sum, s) => sum + (s.total_correct || 0), 0),
        bestStreak: Math.max(...sessionData.map(s => s.max_streak || 0), 0),
        perfectGames: sessionData.filter(s => s.total_correct === s.total_attempts && s.total_attempts > 0).length,
        streakAchievements: {
          streak5: sessionData.some(s => (s.max_streak || 0) >= 5),
          streak10: sessionData.some(s => (s.max_streak || 0) >= 10),
          streak15: sessionData.some(s => (s.max_streak || 0) >= 15)
        }
      };
    },
    { staleTime: 5 * 60 * 1000 }
  );
};

export const useDecades = () => {
  return useOptimizedQuery(
    ['decades-optimized'],
    async () => {
      const { data: playersData, error } = await supabase
        .from('players')
        .select('decades')
        .not('decades', 'is', null);
      
      if (error) throw error;
      
      const decades = new Set<string>();
      playersData?.forEach(player => {
        if (player.decades && Array.isArray(player.decades)) {
          player.decades.forEach((decade: string) => decades.add(decade));
        }
      });
      
      return Array.from(decades).sort();
    },
    { staleTime: 30 * 60 * 1000 } // Cache por 30 minutos
  );
};