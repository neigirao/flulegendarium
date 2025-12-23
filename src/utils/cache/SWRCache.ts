import { indexedDBCache } from './IndexedDBCache';
import { unifiedCache } from './UnifiedCacheManager';
import { logger } from '@/utils/logger';

interface SWROptions {
  ttl?: number;           // Time-to-live in ms
  staleTime?: number;     // Time after which data is considered stale
  persistOffline?: boolean; // Whether to persist in IndexedDB
}

const DEFAULT_OPTIONS: SWROptions = {
  ttl: 5 * 60 * 1000,        // 5 minutes
  staleTime: 1 * 60 * 1000,  // 1 minute
  persistOffline: true
};

/**
 * Stale-While-Revalidate cache wrapper
 * Returns cached data immediately while fetching fresh data in background
 */
export async function fetchWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 1. Try memory cache first (fastest)
  const memCached = unifiedCache.get<{ data: T; timestamp: number }>(key);
  if (memCached) {
    const age = Date.now() - memCached.timestamp;
    
    if (age < opts.staleTime!) {
      // Fresh data - return immediately
      logger.debug(`SWR fresh from memory: ${key}`, 'SWR');
      return memCached.data;
    }
    
    // Stale data - return and revalidate in background
    logger.debug(`SWR stale, revalidating: ${key}`, 'SWR');
    revalidateInBackground(key, fetcher, opts);
    return memCached.data;
  }

  // 2. Try IndexedDB (offline persistence)
  if (opts.persistOffline) {
    const idbCached = await indexedDBCache.get<{ data: T; timestamp: number }>(key);
    if (idbCached) {
      const age = Date.now() - idbCached.timestamp;
      
      // Store in memory for faster subsequent access
      unifiedCache.set(key, idbCached, opts.ttl);
      
      if (age < opts.staleTime!) {
        logger.debug(`SWR fresh from IndexedDB: ${key}`, 'SWR');
        return idbCached.data;
      }
      
      // Stale - return and revalidate
      logger.debug(`SWR stale from IndexedDB, revalidating: ${key}`, 'SWR');
      revalidateInBackground(key, fetcher, opts);
      return idbCached.data;
    }
  }

  // 3. No cache - fetch fresh data
  logger.debug(`SWR cache miss, fetching: ${key}`, 'SWR');
  return fetchAndCache(key, fetcher, opts);
}

async function fetchAndCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: SWROptions
): Promise<T> {
  const data = await fetcher();
  const entry = { data, timestamp: Date.now() };
  
  // Store in memory
  unifiedCache.set(key, entry, opts.ttl);
  
  // Store in IndexedDB for offline
  if (opts.persistOffline) {
    indexedDBCache.set(key, entry, opts.ttl);
  }
  
  logger.debug(`SWR cached: ${key}`, 'SWR');
  return data;
}

function revalidateInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: SWROptions
): void {
  // Use requestIdleCallback for non-blocking revalidation
  const doRevalidate = async () => {
    try {
      await fetchAndCache(key, fetcher, opts);
      logger.debug(`SWR revalidated: ${key}`, 'SWR');
    } catch (err) {
      logger.warn(`SWR revalidation failed: ${key}`, 'SWR');
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(doRevalidate, { timeout: 5000 });
  } else {
    setTimeout(doRevalidate, 100);
  }
}

/**
 * Invalidate cache for a specific key
 */
export function invalidateSWRCache(key: string): void {
  unifiedCache.delete(key);
  indexedDBCache.delete(key);
  logger.debug(`SWR invalidated: ${key}`, 'SWR');
}

/**
 * Prefetch data into cache
 */
export async function prefetchSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Only prefetch if not already cached
  if (!unifiedCache.has(key)) {
    try {
      await fetchAndCache(key, fetcher, opts);
      logger.debug(`SWR prefetched: ${key}`, 'SWR');
    } catch (err) {
      logger.warn(`SWR prefetch failed: ${key}`, 'SWR');
    }
  }
}
