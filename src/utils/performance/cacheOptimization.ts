import { QueryClient } from '@tanstack/react-query';

// Detect if we're in iframe context
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Advanced caching strategies with iframe context awareness
export const createOptimizedQueryClient = () => {
  const inIframe = isInIframe();
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Shorter cache for iframe context to ensure fresh data
        staleTime: inIframe ? 30 * 1000 : 5 * 60 * 1000, // 30s in iframe, 5min standalone
        gcTime: inIframe ? 2 * 60 * 1000 : 10 * 60 * 1000, // 2min in iframe, 10min standalone
        // Force refresh on mount in iframe context
        refetchOnMount: inIframe ? 'always' : true,
        // Retry failed requests
        retry: (failureCount, error: Error & { status?: number }) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        // Background refetch optimizations
        refetchOnWindowFocus: inIframe ? true : false, // More aggressive in iframe
        refetchOnReconnect: true,
      },
    },
  });
};

// Smart cache invalidation strategies with iframe awareness
export const cacheStrategies = {
  // Players data - adjust based on context
  players: {
    staleTime: isInIframe() ? 5 * 60 * 1000 : 30 * 60 * 1000, // 5min iframe, 30min standalone
    gcTime: isInIframe() ? 10 * 60 * 1000 : 60 * 60 * 1000, // 10min iframe, 1h standalone
  },
  
  // Game stats - critical for homepage, shorter cache in iframe
  gameStats: {
    staleTime: isInIframe() ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1min iframe, 5min standalone
    gcTime: isInIframe() ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5min iframe, 15min standalone
  },
  
  // Live data - very short cache, especially in iframe
  liveStats: {
    staleTime: isInIframe() ? 10 * 1000 : 30 * 1000, // 10s iframe, 30s standalone
    gcTime: isInIframe() ? 1 * 60 * 1000 : 2 * 60 * 1000, // 1min iframe, 2min standalone
  },
  
  // User specific data - session cache, aggressive refresh in iframe
  userStats: {
    staleTime: isInIframe() ? 30 * 1000 : 2 * 60 * 1000, // 30s iframe, 2min standalone
    gcTime: isInIframe() ? 5 * 60 * 1000 : 10 * 60 * 1000, // 5min iframe, 10min standalone
  },
  
  // Rankings - critical for homepage, shorter cache in iframe
  rankings: {
    staleTime: isInIframe() ? 2 * 60 * 1000 : 10 * 60 * 1000, // 2min iframe, 10min standalone
    gcTime: isInIframe() ? 10 * 60 * 1000 : 30 * 60 * 1000, // 10min iframe, 30min standalone
  }
};

// Memory-efficient query key factory
export const queryKeys = {
  players: {
    all: ['players'] as const,
    lists: () => [...queryKeys.players.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.players.lists(), filters] as const,
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
    filtered: (filters: Record<string, unknown>) => [...queryKeys.rankings.all, 'filtered', filters] as const,
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
