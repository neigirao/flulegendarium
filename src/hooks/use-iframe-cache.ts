import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';

// Detect if we're in iframe context
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export const useIframeCache = () => {
  const queryClient = useQueryClient();
  const inIframe = isInIframe();

  // Force refresh critical queries when in iframe context
  const forceCriticalRefresh = useCallback(async () => {
    if (!inIframe) return;

    console.log('🔄 Iframe context detected - refreshing critical queries');
    
    // Invalidate critical homepage data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-general-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-player-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-rankings'] }),
      queryClient.invalidateQueries({ queryKey: ['game-stats-optimized'] }),
      queryClient.invalidateQueries({ queryKey: ['rankings'] }),
      queryClient.invalidateQueries({ queryKey: ['liveStats'] }),
    ]);
  }, [queryClient, inIframe]);

  // Auto-refresh on component mount if in iframe
  useEffect(() => {
    if (inIframe) {
      forceCriticalRefresh();
    }
  }, [forceCriticalRefresh, inIframe]);

  // Add cache debugging
  const debugCache = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const queries = queryClient.getQueryCache().getAll();
      console.log('🧠 Cache Debug:', {
        context: inIframe ? 'iframe' : 'standalone',
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      });
    }
  }, [queryClient, inIframe]);

  return {
    inIframe,
    forceCriticalRefresh,
    debugCache,
  };
};