
import { CachedImage } from './types';
import { CACHE_EXPIRATION } from './constants';

// Image cache with expiration time - optimized with WeakMap where possible
export const imageCache = new Map<string, CachedImage>();

// Function to clean expired cache entries - runs more efficiently
export const cleanExpiredCache = () => {
  const now = Date.now();
  const toDelete: string[] = [];
  
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      toDelete.push(key);
    }
  }
  
  toDelete.forEach(key => imageCache.delete(key));
  
  if (toDelete.length > 0) {
    console.log(`🧹 Cleaned ${toDelete.length} expired cache entries`);
  }
};

// Mark an image as loaded in cache
export const markImageAsLoaded = (playerId: string): void => {
  const cached = imageCache.get(playerId);
  if (cached) {
    imageCache.set(playerId, { ...cached, loaded: true });
  }
};

// Check if an image is already loaded in cache
export const isImageLoaded = (playerId: string): boolean => {
  const cached = imageCache.get(playerId);
  return cached?.loaded === true;
};

// Auto-cleanup expired cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanExpiredCache, 5 * 60 * 1000);
}

// Re-export the cache expiration constant
export { CACHE_EXPIRATION };
