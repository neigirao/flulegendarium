import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  imageCache, 
  cleanExpiredCache, 
  clearAllImageCache, 
  markImageAsLoaded, 
  isImageLoaded 
} from '../cache';
import { CACHE_EXPIRATION } from '../constants';

describe('player-image/cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    imageCache.clear();
  });

  afterEach(() => {
    imageCache.clear();
  });

  describe('imageCache', () => {
    it('should be a Map instance', () => {
      expect(imageCache instanceof Map).toBe(true);
    });

    it('should store cached images', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/image.jpg',
        timestamp: Date.now(),
        loaded: false
      });

      expect(imageCache.has('player-1')).toBe(true);
      expect(imageCache.get('player-1')?.url).toBe('https://example.com/image.jpg');
    });

    it('should allow multiple entries', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/1.jpg',
        timestamp: Date.now(),
        loaded: false
      });
      imageCache.set('player-2', {
        url: 'https://example.com/2.jpg',
        timestamp: Date.now(),
        loaded: true
      });

      expect(imageCache.size).toBe(2);
    });
  });

  describe('cleanExpiredCache', () => {
    it('should remove expired entries', () => {
      const now = Date.now();
      
      // Add expired entry
      imageCache.set('expired', {
        url: 'https://example.com/expired.jpg',
        timestamp: now - CACHE_EXPIRATION - 1000, // Expired
        loaded: true
      });
      
      // Add valid entry
      imageCache.set('valid', {
        url: 'https://example.com/valid.jpg',
        timestamp: now, // Current
        loaded: true
      });

      cleanExpiredCache();

      expect(imageCache.has('expired')).toBe(false);
      expect(imageCache.has('valid')).toBe(true);
    });

    it('should keep non-expired entries', () => {
      const now = Date.now();
      
      imageCache.set('recent', {
        url: 'https://example.com/recent.jpg',
        timestamp: now - 1000, // 1 second ago
        loaded: true
      });

      cleanExpiredCache();

      expect(imageCache.has('recent')).toBe(true);
    });

    it('should handle empty cache', () => {
      expect(() => cleanExpiredCache()).not.toThrow();
      expect(imageCache.size).toBe(0);
    });

    it('should remove all expired entries in single call', () => {
      const now = Date.now();
      const expiredTime = now - CACHE_EXPIRATION - 1000;
      
      for (let i = 0; i < 10; i++) {
        imageCache.set(`expired-${i}`, {
          url: `https://example.com/${i}.jpg`,
          timestamp: expiredTime,
          loaded: true
        });
      }

      expect(imageCache.size).toBe(10);
      
      cleanExpiredCache();

      expect(imageCache.size).toBe(0);
    });

    it('should handle mixed expired and valid entries', () => {
      const now = Date.now();
      const expiredTime = now - CACHE_EXPIRATION - 1000;
      
      imageCache.set('expired-1', {
        url: 'https://example.com/e1.jpg',
        timestamp: expiredTime,
        loaded: true
      });
      imageCache.set('valid-1', {
        url: 'https://example.com/v1.jpg',
        timestamp: now,
        loaded: true
      });
      imageCache.set('expired-2', {
        url: 'https://example.com/e2.jpg',
        timestamp: expiredTime,
        loaded: true
      });
      imageCache.set('valid-2', {
        url: 'https://example.com/v2.jpg',
        timestamp: now - 100,
        loaded: true
      });

      cleanExpiredCache();

      expect(imageCache.size).toBe(2);
      expect(imageCache.has('valid-1')).toBe(true);
      expect(imageCache.has('valid-2')).toBe(true);
      expect(imageCache.has('expired-1')).toBe(false);
      expect(imageCache.has('expired-2')).toBe(false);
    });
  });

  describe('clearAllImageCache', () => {
    it('should clear entire cache', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/1.jpg',
        timestamp: Date.now(),
        loaded: true
      });
      imageCache.set('player-2', {
        url: 'https://example.com/2.jpg',
        timestamp: Date.now(),
        loaded: true
      });

      expect(imageCache.size).toBe(2);

      clearAllImageCache();

      expect(imageCache.size).toBe(0);
    });

    it('should handle already empty cache', () => {
      expect(() => clearAllImageCache()).not.toThrow();
      expect(imageCache.size).toBe(0);
    });

    it('should clear cache regardless of expiration status', () => {
      const now = Date.now();
      
      imageCache.set('valid', {
        url: 'https://example.com/valid.jpg',
        timestamp: now,
        loaded: true
      });
      imageCache.set('expired', {
        url: 'https://example.com/expired.jpg',
        timestamp: now - CACHE_EXPIRATION - 1000,
        loaded: true
      });

      clearAllImageCache();

      expect(imageCache.size).toBe(0);
    });
  });

  describe('markImageAsLoaded', () => {
    it('should update loaded status to true', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/image.jpg',
        timestamp: Date.now(),
        loaded: false
      });

      markImageAsLoaded('player-1');

      expect(imageCache.get('player-1')?.loaded).toBe(true);
    });

    it('should preserve other properties', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const originalTimestamp = Date.now();
      
      imageCache.set('player-1', {
        url: originalUrl,
        timestamp: originalTimestamp,
        loaded: false
      });

      markImageAsLoaded('player-1');

      const cached = imageCache.get('player-1');
      expect(cached?.url).toBe(originalUrl);
      expect(cached?.timestamp).toBe(originalTimestamp);
    });

    it('should handle non-existent player id', () => {
      expect(() => markImageAsLoaded('non-existent')).not.toThrow();
      expect(imageCache.has('non-existent')).toBe(false);
    });

    it('should not create entry for non-existent player', () => {
      markImageAsLoaded('new-player');
      
      expect(imageCache.has('new-player')).toBe(false);
    });

    it('should handle already loaded image', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/image.jpg',
        timestamp: Date.now(),
        loaded: true
      });

      markImageAsLoaded('player-1');

      expect(imageCache.get('player-1')?.loaded).toBe(true);
    });
  });

  describe('isImageLoaded', () => {
    it('should return true for loaded images', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/image.jpg',
        timestamp: Date.now(),
        loaded: true
      });

      expect(isImageLoaded('player-1')).toBe(true);
    });

    it('should return false for non-loaded images', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/image.jpg',
        timestamp: Date.now(),
        loaded: false
      });

      expect(isImageLoaded('player-1')).toBe(false);
    });

    it('should return false for non-cached images', () => {
      expect(isImageLoaded('non-existent')).toBe(false);
    });

    it('should return false for empty player id', () => {
      expect(isImageLoaded('')).toBe(false);
    });

    it('should correctly report status after markImageAsLoaded', () => {
      imageCache.set('player-1', {
        url: 'https://example.com/image.jpg',
        timestamp: Date.now(),
        loaded: false
      });

      expect(isImageLoaded('player-1')).toBe(false);
      
      markImageAsLoaded('player-1');
      
      expect(isImageLoaded('player-1')).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should support typical game flow', () => {
      const playerId = 'romario-123';
      
      // Initial cache (not loaded yet)
      imageCache.set(playerId, {
        url: 'https://example.com/romario.jpg',
        timestamp: Date.now(),
        loaded: false
      });
      
      expect(isImageLoaded(playerId)).toBe(false);
      
      // Image loads
      markImageAsLoaded(playerId);
      
      expect(isImageLoaded(playerId)).toBe(true);
      
      // Game ends, cache cleared
      clearAllImageCache();
      
      expect(isImageLoaded(playerId)).toBe(false);
    });

    it('should handle session with multiple players', () => {
      const players = ['player-1', 'player-2', 'player-3'];
      
      // Cache all players
      players.forEach((id, index) => {
        imageCache.set(id, {
          url: `https://example.com/${id}.jpg`,
          timestamp: Date.now(),
          loaded: false
        });
      });
      
      expect(imageCache.size).toBe(3);
      
      // Mark first player as loaded
      markImageAsLoaded('player-1');
      
      expect(isImageLoaded('player-1')).toBe(true);
      expect(isImageLoaded('player-2')).toBe(false);
      expect(isImageLoaded('player-3')).toBe(false);
      
      // Mark remaining as loaded
      markImageAsLoaded('player-2');
      markImageAsLoaded('player-3');
      
      players.forEach(id => {
        expect(isImageLoaded(id)).toBe(true);
      });
    });
  });
});
