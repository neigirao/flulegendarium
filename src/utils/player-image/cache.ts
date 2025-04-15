
import { CachedImage } from './types';
import { CACHE_EXPIRATION } from './constants';

// Image cache with expiration time
export const imageCache = new Map<string, CachedImage>();

// Function to clean expired cache entries
export const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      imageCache.delete(key);
    }
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

// Re-export the cache expiration constant to avoid the error
export { CACHE_EXPIRATION };
