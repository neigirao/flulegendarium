import { QueryClient } from '@tanstack/react-query';

// Advanced caching strategies
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        // Background refetch optimizations
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
    },
  });
};

// Smart cache invalidation strategies
export const cacheStrategies = {
  // Players data - long cache, infrequent updates
  players: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Game stats - medium cache, moderate updates
  gameStats: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  
  // Live data - short cache, frequent updates
  liveStats: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // User specific data - session cache
  userStats: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Rankings - moderate cache
  rankings: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  }
};

// Memory-efficient query key factory
export const queryKeys = {
  players: {
    all: ['players'] as const,
    lists: () => [...queryKeys.players.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.players.lists(), filters] as const,
    details: () => [...queryKeys.players.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.players.details(), id] as const,
  },
  
  gameStats: {
    all: ['gameStats'] as const,
    general: () => [...queryKeys.gameStats.all, 'general'] as const,
    user: (userId: string) => [...queryKeys.gameStats.all, 'user', userId] as const,
  },
  
  rankings: {
    all: ['rankings'] as const,
    global: () => [...queryKeys.rankings.all, 'global'] as const,
    filtered: (filters: Record<string, any>) => [...queryKeys.rankings.all, 'filtered', filters] as const,
  },
  
  liveStats: {
    all: ['liveStats'] as const,
    current: () => [...queryKeys.liveStats.all, 'current'] as const,
  }
};

// Advanced prefetching strategies
export const prefetchStrategies = {
  // Prefetch next likely pages based on user behavior
  async prefetchGameModes(queryClient: QueryClient) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.players.lists(),
      queryFn: () => fetch('/api/players').then(r => r.json()),
      ...cacheStrategies.players
    });
  },
  
  // Prefetch user-specific data when logged in
  async prefetchUserData(queryClient: QueryClient, userId: string) {
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.gameStats.user(userId),
        queryFn: () => fetch(`/api/user-stats/${userId}`).then(r => r.json()),
        ...cacheStrategies.userStats
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.rankings.global(),
        queryFn: () => fetch('/api/rankings').then(r => r.json()),
        ...cacheStrategies.rankings
      })
    ]);
  }
};

// Intelligent cache warming
export const cacheWarming = {
  // Warm critical data on app start
  async warmCriticalCache(queryClient: QueryClient) {
    // Essential game data
    queryClient.prefetchQuery({
      queryKey: queryKeys.gameStats.general(),
      queryFn: () => fetch('/api/game-stats').then(r => r.json()),
      ...cacheStrategies.gameStats
    });
    
    // Popular players (for game modes)
    queryClient.prefetchQuery({
      queryKey: queryKeys.players.list({ popular: true, limit: 20 }),
      queryFn: () => fetch('/api/players?popular=true&limit=20').then(r => r.json()),
      ...cacheStrategies.players
    });
  },
  
  // Background refresh of stale data
  async backgroundRefresh(queryClient: QueryClient) {
    const queries = queryClient.getQueryCache().getAll();
    
    queries.forEach(query => {
      const { queryKey, state } = query;
      
      // Refresh if data is old and not currently fetching
      if (state.dataUpdatedAt && Date.now() - state.dataUpdatedAt > 5 * 60 * 1000) {
        if (state.fetchStatus !== 'fetching') {
          queryClient.invalidateQueries({ queryKey });
        }
      }
    });
  }
};
