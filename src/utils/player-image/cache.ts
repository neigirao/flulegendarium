
import { CachedImage } from './types';
import { CACHE_EXPIRATION } from './constants';

export const imageCache = new Map<string, CachedImage>();

export const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      imageCache.delete(key);
    }
  }
};

export const markImageAsLoaded = (playerId: string) => {
  const cached = imageCache.get(playerId);
  if (cached) {
    imageCache.set(playerId, { ...cached, loaded: true });
  }
};

export const isImageLoaded = (playerId: string): boolean => {
  const cached = imageCache.get(playerId);
  return cached ? cached.loaded : false;
};
