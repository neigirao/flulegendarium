import { supabase } from '@/integrations/supabase/client';

// Database query optimization utilities
export const optimizedQueries = {
  // Batch operations for better performance
  async batchPlayerData(playerIds: string[]) {
    // Use single query with IN clause instead of multiple queries
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        name,
        image_url,
        position,
        difficulty_level,
        statistics,
        decades
      `)
      .in('id', playerIds);
    
    if (error) throw error;
    return data;
  },

  // Optimized game stats with aggregation
  async getOptimizedGameStats() {
    const [sessionsResult, attemptsResult, playersResult] = await Promise.all([
      supabase
        .from('game_sessions')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('game_attempts')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('players')
        .select('id', { count: 'exact', head: true })
    ]);

    return {
      totalGames: sessionsResult.count || 0,
      totalAttempts: attemptsResult.count || 0,
      totalPlayers: playersResult.count || 0
    };
  },

  // Paginated rankings with performance optimization
  async getOptimizedRankings(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabase
      .from('rankings')
      .select(`
        id,
        player_name,
        score,
        games_played,
        difficulty_level,
        game_mode,
        created_at
      `)
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Efficient player search with indexing
  async searchPlayersOptimized(searchTerm: string, limit = 20) {
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        name,
        image_url,
        position,
        difficulty_level
      `)
      .or(`name.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`)
      .order('name')
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Optimized user game history with aggregation
  async getUserGameHistoryOptimized(userId: string) {
    const { data, error } = await supabase
      .from('user_game_history')
      .select(`
        score,
        correct_guesses,
        total_attempts,
        game_mode,
        difficulty_level,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent games for performance

    if (error) throw error;
    return data;
  }
};

// Connection pooling and performance monitoring
export const dbPerformance = {
  // Monitor query performance
  async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
      }
      
      // Track in analytics if available
      if (window.gtag) {
        window.gtag('event', 'database_query', {
          query_name: queryName,
          duration: Math.round(duration),
          custom_parameter_1: duration > 1000 ? 'slow' : 'fast'
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Query failed: ${queryName} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Batch multiple queries efficiently
  async batchQueries<T extends Record<string, () => Promise<any>>>(
    queries: T
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
    const queryEntries = Object.entries(queries);
    const startTime = performance.now();
    
    try {
      const results = await Promise.all(
        queryEntries.map(async ([key, queryFn]) => [key, await queryFn()])
      );
      
      const duration = performance.now() - startTime;
      console.log(`📊 Batch query completed in ${duration.toFixed(2)}ms`);
      
      return Object.fromEntries(results) as any;
    } catch (error) {
      console.error('❌ Batch query failed:', error);
      throw error;
    }
  }
};

// Real-time optimization for live features
export const realtimeOptimization = {
  // Throttled real-time updates
  createThrottledSubscription(
    table: string,
    callback: (payload: any) => void,
    throttleMs = 1000
  ) {
    let lastUpdate = 0;
    let pendingUpdate: any = null;
    
    return supabase
      .channel(`throttled_${table}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table 
        },
        (payload) => {
          const now = Date.now();
          
          if (now - lastUpdate >= throttleMs) {
            callback(payload);
            lastUpdate = now;
          } else {
            // Queue the update
            pendingUpdate = payload;
            
            setTimeout(() => {
              if (pendingUpdate) {
                callback(pendingUpdate);
                pendingUpdate = null;
                lastUpdate = Date.now();
              }
            }, throttleMs - (now - lastUpdate));
          }
        }
      )
      .subscribe();
  },

  // Optimized presence tracking
  createOptimizedPresence(channelName: string, userInfo: any) {
    return supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userInfo.id,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        // Batch presence updates
        const state = supabase.channel(channelName).presenceState();
        console.log('👥 Presence sync:', Object.keys(state).length, 'users online');
      })
      .subscribe();
  }
};