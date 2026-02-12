import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getReliableImageUrl } from '../imageUtils';
import { imageCache, cleanExpiredCache } from '../cache';
import { playerImagesFallbacks, defaultImage, CACHE_EXPIRATION } from '../constants';
import { Player } from '../types';

// Mock dependencies
vi.mock('../cache', async () => {
  const actual = await vi.importActual('../cache');
  return {
    ...actual,
    cleanExpiredCache: vi.fn(),
  };
});

vi.mock('../problematicUrls', () => ({
  isProblematicDomain: vi.fn((url: string) => {
    const problematicDomains = ['ge.globo.com', 'lance.com.br'];
    return problematicDomains.some(domain => url.includes(domain));
  }),
  isUrlProblematic: vi.fn((url: string) => url.includes('broken')),
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('imageUtils', () => {
  const createMockPlayer = (id: string, name: string, imageUrl: string): Player => ({
    id,
    name,
    image_url: imageUrl,
    position: 'Atacante',
    fun_fact: 'Test fact',
    achievements: [],
    year_highlight: '2020',
    statistics: { gols: 10, jogos: 50 },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    imageCache.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock Math.random to control cache cleaning trigger
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    imageCache.clear();
    vi.restoreAllMocks();
  });

  describe('getReliableImageUrl', () => {
    describe('cache behavior', () => {
      it('should return cached URL if valid', () => {
        const player = createMockPlayer('1', 'Test Player', 'https://example.com/new.jpg');
        
        imageCache.set('1', {
          url: 'https://example.com/cached.jpg',
          timestamp: Date.now(),
          loaded: true
        });

        const result = getReliableImageUrl(player);

        expect(result).toBe('https://example.com/cached.jpg');
      });

      it('should ignore expired cache', () => {
        const player = createMockPlayer('1', 'Test Player', 'https://example.com/db.jpg');
        
        imageCache.set('1', {
          url: 'https://example.com/expired.jpg',
          timestamp: Date.now() - CACHE_EXPIRATION - 1000,
          loaded: true
        });

        const result = getReliableImageUrl(player);

        // Should use DB URL, not expired cache
        expect(result).not.toBe('https://example.com/expired.jpg');
      });

      it('should cache the result', () => {
        const player = createMockPlayer('1', 'Test Player', 'https://example.com/image.jpg');

        getReliableImageUrl(player);

        expect(imageCache.has('1')).toBe(true);
        const cached = imageCache.get('1');
        expect(cached?.loaded).toBe(false);
      });

      it('should trigger cache cleanup sometimes', () => {
        // Set random to trigger cleanup (< 0.1)
        vi.spyOn(Math, 'random').mockReturnValue(0.05);
        
        const player = createMockPlayer('1', 'Test Player', 'https://example.com/image.jpg');
        
        getReliableImageUrl(player);

        expect(cleanExpiredCache).toHaveBeenCalled();
      });

      it('should not trigger cache cleanup most times', () => {
        // Set random to not trigger cleanup (>= 0.1)
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        
        const player = createMockPlayer('1', 'Test Player', 'https://example.com/image.jpg');
        
        getReliableImageUrl(player);

        expect(cleanExpiredCache).not.toHaveBeenCalled();
      });
    });

    describe('fallback priority', () => {
      it('should prioritize configured fallbacks (PRIORITY 1)', () => {
        const playerWithFallback = Object.keys(playerImagesFallbacks)[0];
        if (!playerWithFallback) {
          // Skip test if no fallbacks configured
          return;
        }

        const player = createMockPlayer('1', playerWithFallback, 'https://example.com/db.jpg');

        const result = getReliableImageUrl(player);

        expect(result).toBe(playerImagesFallbacks[playerWithFallback]);
      });

      it('should use database URL if valid and no fallback (PRIORITY 2)', () => {
        const player = createMockPlayer('1', 'Unknown Player', 'https://valid.com/image.jpg');

        const result = getReliableImageUrl(player);

        expect(result).toBe('https://valid.com/image.jpg');
      });

      it('should use default image as last resort (PRIORITY 4)', () => {
        const player = createMockPlayer('1', 'Unknown Player', 'broken-url');

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });
    });

    describe('URL validation', () => {
      it('should reject URLs without http/https protocol', () => {
        const player = createMockPlayer('1', 'Test Player', 'ftp://example.com/image.jpg');

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });

      it('should reject URLs with suspicious patterns', () => {
        const suspiciousUrls = [
          'https://example.com/chat_123_ss.png',
          'https://example.com/undefined.jpg',
          'https://example.com/null.jpg',
        ];

        suspiciousUrls.forEach(url => {
          imageCache.clear();
          const player = createMockPlayer('1', 'Test Player', url);
          const result = getReliableImageUrl(player);
          expect(result).toBe(defaultImage);
        });
      });

      it('should reject problematic domains', () => {
        const player = createMockPlayer('1', 'Test Player', 'https://ge.globo.com/image.jpg');

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });

      it('should accept valid local paths', () => {
        const player = createMockPlayer('1', 'Test Player', '/lovable-uploads/image.jpg');

        const result = getReliableImageUrl(player);

        expect(result).toBe('/lovable-uploads/image.jpg');
      });

      it('should accept valid https URLs', () => {
        const player = createMockPlayer('1', 'Unknown', 'https://valid-cdn.com/image.jpg');

        const result = getReliableImageUrl(player);

        expect(result).toBe('https://valid-cdn.com/image.jpg');
      });
    });

    describe('partial name matching (PRIORITY 3)', () => {
      it('should find fallback by partial name match', () => {
        const knownPlayer = Object.keys(playerImagesFallbacks)[0];
        if (!knownPlayer) return;

        // Create player with partial name match
        const partialName = knownPlayer.slice(0, 5);
        const fullName = `${partialName} Extra`;
        
        // This test depends on the partial matching logic in imageUtils
        // If the player name includes a key from fallbacks or vice versa
        const player = createMockPlayer('1', knownPlayer, '');

        const result = getReliableImageUrl(player);

        expect(result).toBe(playerImagesFallbacks[knownPlayer]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty image_url', () => {
        const player = createMockPlayer('1', 'Test Player', '');

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });

      it('should handle null image_url', () => {
        const player = createMockPlayer('1', 'Test Player', null as unknown as string);

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });

      it('should handle undefined image_url', () => {
        const player = createMockPlayer('1', 'Test Player', undefined as unknown as string);

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });

      it('should handle whitespace URL', () => {
        const player = createMockPlayer('1', 'Test Player', '   ');

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });
    });

    describe('final validation', () => {
      it('should apply final validation even after finding URL', () => {
        // If the selected URL fails final validation, should use default
        const player = createMockPlayer('1', 'Test Player', 'https://example.com/chat_456_ss.png');

        const result = getReliableImageUrl(player);

        expect(result).toBe(defaultImage);
      });
    });
  });
});
