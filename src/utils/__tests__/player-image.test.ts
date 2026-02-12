
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  imageCache,
  cleanExpiredCache,
  markImageAsLoaded,
  isImageLoaded,
  isProblematicDomain,
  isUrlProblematic,
  markUrlAsProblematic,
  clearProblematicUrlsCache,
  getProblematicUrlsStats,
} from '../player-image';
import type { CachedImage } from '../player-image/types';

describe('player-image utilities', () => {
  beforeEach(() => {
    // Clear caches before each test
    imageCache.clear();
    clearProblematicUrlsCache();
  });

  describe('imageCache', () => {
    it('should be a Map instance', () => {
      expect(imageCache instanceof Map).toBe(true);
    });

    it('should allow setting and getting values', () => {
      const testUrl = 'https://example.com/test.jpg';
      const testValue: CachedImage = { url: testUrl, timestamp: Date.now(), loaded: true };
      
      imageCache.set(testUrl, testValue);
      expect(imageCache.get(testUrl)).toEqual(testValue);
    });

    it('should be clearable', () => {
      const testValue: CachedImage = { url: 'test1', timestamp: Date.now(), loaded: true };
      imageCache.set('test1', testValue);
      imageCache.set('test2', { ...testValue, url: 'test2' });
      
      imageCache.clear();
      expect(imageCache.size).toBe(0);
    });
  });

  describe('markImageAsLoaded / isImageLoaded', () => {
    it('should mark an image as loaded', () => {
      const url = 'https://example.com/image.jpg';
      
      markImageAsLoaded(url);
      expect(isImageLoaded(url)).toBe(true);
    });

    it('should return false for unloaded images', () => {
      expect(isImageLoaded('https://example.com/unknown.jpg')).toBe(false);
    });
  });

  describe('cleanExpiredCache', () => {
    it('should be a function', () => {
      expect(typeof cleanExpiredCache).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => cleanExpiredCache()).not.toThrow();
    });
  });

  describe('isProblematicDomain', () => {
    it('should identify known problematic domains', () => {
      expect(isProblematicDomain('https://ge.globo.com/image.jpg')).toBe(true);
      expect(isProblematicDomain('https://lance.com.br/image.jpg')).toBe(true);
    });

    it('should return false for safe domains', () => {
      expect(isProblematicDomain('https://lovable.dev/image.jpg')).toBe(false);
      expect(isProblematicDomain('https://supabase.co/storage/image.jpg')).toBe(false);
    });

    it('should handle malformed URLs gracefully', () => {
      expect(isProblematicDomain('')).toBe(false);
      expect(isProblematicDomain('not-a-url')).toBe(false);
    });
  });

  describe('isUrlProblematic', () => {
    it('should detect manually marked URLs after multiple failures', () => {
      const url = 'https://example.com/marked.jpg';
      markUrlAsProblematic(url);
      markUrlAsProblematic(url); // Mark twice to trigger threshold
      expect(isUrlProblematic(url)).toBe(true);
    });

    it('should return false for valid URLs', () => {
      expect(isUrlProblematic('https://safe-site.com/image.jpg')).toBe(false);
    });
  });

  describe('markUrlAsProblematic', () => {
    it('should mark a URL as problematic after threshold', () => {
      const url = 'https://example.com/problem.jpg';
      
      markUrlAsProblematic(url);
      markUrlAsProblematic(url); // Second mark triggers threshold
      expect(isUrlProblematic(url)).toBe(true);
    });
  });

  describe('clearProblematicUrlsCache', () => {
    it('should clear all marked URLs', () => {
      markUrlAsProblematic('https://example.com/1.jpg');
      markUrlAsProblematic('https://example.com/1.jpg');
      markUrlAsProblematic('https://example.com/2.jpg');
      markUrlAsProblematic('https://example.com/2.jpg');
      
      clearProblematicUrlsCache();
      
      expect(isUrlProblematic('https://example.com/1.jpg')).toBe(false);
      expect(isUrlProblematic('https://example.com/2.jpg')).toBe(false);
    });
  });

  describe('getProblematicUrlsStats', () => {
    it('should return stats object', () => {
      const stats = getProblematicUrlsStats();
      
      expect(stats).toHaveProperty('total');
      expect(typeof stats.total).toBe('number');
    });

    it('should track marked URLs count', () => {
      clearProblematicUrlsCache();
      
      markUrlAsProblematic('https://example.com/a.jpg');
      markUrlAsProblematic('https://example.com/b.jpg');
      
      const stats = getProblematicUrlsStats();
      expect(stats.total).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('URL validation', () => {
  describe('Edge cases', () => {
    it('should handle null URLs', () => {
      expect(isProblematicDomain(null as unknown as string)).toBe(false);
      expect(isUrlProblematic(null as unknown as string)).toBe(false);
    });

    it('should handle undefined URLs', () => {
      expect(isProblematicDomain(undefined as unknown as string)).toBe(false);
      expect(isUrlProblematic(undefined as unknown as string)).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isProblematicDomain('')).toBe(false);
      expect(isUrlProblematic('')).toBe(false);
    });

    it('should handle URLs with special characters', () => {
      const urlWithParams = 'https://example.com/image.jpg?size=large&quality=high';
      expect(() => isProblematicDomain(urlWithParams)).not.toThrow();
    });

    it('should handle protocol-relative URLs', () => {
      const protocolRelative = '//example.com/image.jpg';
      expect(() => isProblematicDomain(protocolRelative)).not.toThrow();
    });
  });
});
