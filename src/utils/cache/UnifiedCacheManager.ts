import { Logger } from '@/utils/logger';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl?: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
}

export class UnifiedCacheManager {
  private static instance: UnifiedCacheManager;
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: number;
  private cleanupTimer?: number;

  private constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minute
    
    this.startCleanupTimer();
  }

  static getInstance(options?: CacheOptions): UnifiedCacheManager {
    if (!UnifiedCacheManager.instance) {
      UnifiedCacheManager.instance = new UnifiedCacheManager(options);
    }
    return UnifiedCacheManager.instance;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // If cache is full, remove LRU entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
    Logger.debug(`Cache SET: ${key}`, { size: this.cache.size });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      Logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    Logger.debug(`Cache HIT: ${key}`, { accessCount: entry.accessCount });
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      Logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    Logger.info('Cache cleared');
  }

  // Preload data for expected usage
  preload<T>(key: string, dataLoader: () => Promise<T>, ttl?: number): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const cached = this.get<T>(key);
        if (cached) {
          resolve(cached);
          return;
        }

        const data = await dataLoader();
        this.set(key, data, ttl);
        resolve(data);
      } catch (error) {
        Logger.error(`Cache preload failed: ${key}`, error as Error);
        reject(error);
      }
    });
  }

  // Get with automatic loading
  async getOrLoad<T>(key: string, loader: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await loader();
    this.set(key, data, ttl);
    return data;
  }

  // LRU eviction
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      Logger.debug(`Cache LRU evicted: ${oldestKey}`);
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (entry.ttl && now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.debug(`Cache cleanup: ${cleaned} entries removed`);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    let totalAccess = 0;
    let totalHits = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      totalHits += entry.accessCount > 1 ? entry.accessCount - 1 : 0;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? totalHits / totalAccess : 0,
      memoryUsage: JSON.stringify([...this.cache]).length
    };
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupTimer) {
      window.clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Export singleton instance
export const unifiedCache = UnifiedCacheManager.getInstance();