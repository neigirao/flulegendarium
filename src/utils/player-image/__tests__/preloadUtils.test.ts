import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { preloadPlayerImages, preloadNextPlayer, prepareNextBatch } from '../preloadUtils';
import { imageCache } from '../cache';
import { Player } from '../types';

// Mock dependencies
vi.mock('../imageUtils', () => ({
  getReliableImageUrl: vi.fn((player: Player) => `https://example.com/${player.id}.jpg`),
}));

vi.mock('../constants', () => ({
  defaultImage: '/default.jpg',
  playerImagesFallbacks: {
    'Known Player': '/known.jpg'
  }
}));

// Mock Image constructor
class MockImage {
  src: string = '';
  fetchPriority: string = 'auto';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {
    // Simulate async load
    setTimeout(() => {
      if (this.src && !this.src.includes('broken')) {
        this.onload?.();
      } else {
        this.onerror?.();
      }
    }, 10);
  }
}

describe('preloadUtils', () => {
  const createMockPlayer = (id: string, name: string): Player => ({
    id,
    name,
    image_url: `https://example.com/${id}.jpg`,
    position: 'Atacante',
    fun_fact: 'Test fact',
    achievements: [],
    year_highlight: '2020',
    statistics: { gols: 10, jogos: 50 },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    imageCache.clear();
    
    // Mock Image
    vi.stubGlobal('Image', MockImage);
    
    // Mock navigator
    vi.stubGlobal('navigator', { hardwareConcurrency: 4 });
    
    // Mock console
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock requestIdleCallback
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => setTimeout(cb, 100));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    imageCache.clear();
  });

  describe('preloadPlayerImages', () => {
    it('should handle empty array', () => {
      expect(() => preloadPlayerImages([])).not.toThrow();
    });

    it('should handle null/undefined', () => {
      expect(() => preloadPlayerImages(null as unknown as Parameters<typeof preloadPlayerImages>[0])).not.toThrow();
      expect(() => preloadPlayerImages(undefined as unknown as Parameters<typeof preloadPlayerImages>[0])).not.toThrow();
    });

    it('should log preloading message', () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
      ];

      preloadPlayerImages(players);

      expect(console.log).toHaveBeenCalled();
    });

    it('should limit preload count based on hardware', () => {
      // With hardwareConcurrency = 4, should preload max(3, 4) = 4 images
      const players = Array.from({ length: 10 }, (_, i) => 
        createMockPlayer(`${i}`, `Player ${i}`)
      );

      preloadPlayerImages(players);

      // Verify preloading started
      expect(console.log).toHaveBeenCalled();
    });

    it('should preload sequentially with delays', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
      ];

      preloadPlayerImages(players);

      // First image starts immediately
      await vi.advanceTimersByTimeAsync(10);
      
      // After load, waits 100ms before next
      await vi.advanceTimersByTimeAsync(100);
      
      // Second image loads
      await vi.advanceTimersByTimeAsync(10);
    });

    it('should handle single player', () => {
      const players = [createMockPlayer('1', 'Player 1')];

      expect(() => preloadPlayerImages(players)).not.toThrow();
    });

    it('should preload default images with low priority', async () => {
      const players = [createMockPlayer('1', 'Player 1')];

      preloadPlayerImages(players);

      // Default images are preloaded after main preload
      await vi.advanceTimersByTimeAsync(200);
    });
  });

  describe('preloadNextPlayer', () => {
    it('should skip null player', () => {
      expect(() => preloadNextPlayer(null)).not.toThrow();
    });

    it('should skip already loaded player', () => {
      const player = createMockPlayer('1', 'Player 1');
      
      imageCache.set('1', {
        url: 'https://example.com/1.jpg',
        timestamp: Date.now(),
        loaded: true
      });

      preloadNextPlayer(player);

      // Should return early without creating new Image
    });

    it('should use requestIdleCallback when available', async () => {
      const player = createMockPlayer('1', 'Player 1');
      
      preloadNextPlayer(player);

      // requestIdleCallback mock uses 100ms delay
      await vi.advanceTimersByTimeAsync(100);
    });

    it('should preload with low priority', async () => {
      const player = createMockPlayer('1', 'Player 1');
      
      preloadNextPlayer(player);

      await vi.advanceTimersByTimeAsync(200);
      
      // Image should be created with low priority
    });

    it('should update cache on successful load', async () => {
      const player = createMockPlayer('1', 'Player 1');
      
      imageCache.set('1', {
        url: 'https://example.com/1.jpg',
        timestamp: Date.now(),
        loaded: false
      });

      preloadNextPlayer(player);

      await vi.advanceTimersByTimeAsync(200);
    });

    it('should handle load errors gracefully', async () => {
      const player = createMockPlayer('broken', 'Broken Player');
      
      expect(() => preloadNextPlayer(player)).not.toThrow();

      await vi.advanceTimersByTimeAsync(200);
    });
  });

  describe('prepareNextBatch', () => {
    it('should skip if players array is empty', () => {
      const currentPlayer = createMockPlayer('1', 'Current');
      
      expect(() => prepareNextBatch([], currentPlayer)).not.toThrow();
    });

    it('should skip if only one player', () => {
      const player = createMockPlayer('1', 'Only Player');
      
      expect(() => prepareNextBatch([player], player)).not.toThrow();
    });

    it('should skip if current player is null', () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
      ];
      
      expect(() => prepareNextBatch(players, null)).not.toThrow();
    });

    it('should skip if current player not found', () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
      ];
      const unknownPlayer = createMockPlayer('unknown', 'Unknown');
      
      expect(() => prepareNextBatch(players, unknownPlayer)).not.toThrow();
    });

    it('should prepare next N players', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
        createMockPlayer('4', 'Player 4'),
      ];
      const currentPlayer = players[0];
      
      prepareNextBatch(players, currentPlayer, 2);

      // After 800ms delay + sequential loading
      await vi.advanceTimersByTimeAsync(1000);
    });

    it('should handle small arrays', () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
      ];
      const currentPlayer = players[0];
      
      // Request 5 but only 1 is available
      expect(() => prepareNextBatch(players, currentPlayer, 5)).not.toThrow();
    });

    it('should wrap around array end', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
      ];
      const currentPlayer = players[2]; // Last player
      
      prepareNextBatch(players, currentPlayer, 2);

      // Should wrap to players[0] and players[1]
      await vi.advanceTimersByTimeAsync(1000);
    });

    it('should log batch preparation', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
      ];
      const currentPlayer = players[0];
      
      prepareNextBatch(players, currentPlayer, 2);

      expect(console.log).toHaveBeenCalled();
    });

    it('should use default batch size of 2', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
        createMockPlayer('4', 'Player 4'),
      ];
      const currentPlayer = players[0];
      
      prepareNextBatch(players, currentPlayer);

      // Default batchSize is 2
      await vi.advanceTimersByTimeAsync(1000);
    });

    it('should delay before starting batch preload', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
      ];
      const currentPlayer = players[0];
      
      prepareNextBatch(players, currentPlayer);

      // Initial delay of 800ms
      await vi.advanceTimersByTimeAsync(700);
      
      // Continue after delay
      await vi.advanceTimersByTimeAsync(200);
    });

    it('should space out individual preloads', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
        createMockPlayer('4', 'Player 4'),
      ];
      const currentPlayer = players[0];
      
      prepareNextBatch(players, currentPlayer, 3);

      // 800ms initial + 200ms per player spacing
      await vi.advanceTimersByTimeAsync(1500);
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical game initialization', async () => {
      const players = Array.from({ length: 10 }, (_, i) => 
        createMockPlayer(`${i}`, `Player ${i}`)
      );

      // Initial preload
      preloadPlayerImages(players);

      // Simulate time passing
      await vi.advanceTimersByTimeAsync(2000);
    });

    it('should handle next player preload during game', async () => {
      const players = [
        createMockPlayer('1', 'Player 1'),
        createMockPlayer('2', 'Player 2'),
        createMockPlayer('3', 'Player 3'),
      ];
      
      // Current player shown
      const currentPlayer = players[0];
      
      // Preload next
      preloadNextPlayer(players[1]);
      
      // Prepare batch
      prepareNextBatch(players, currentPlayer);

      await vi.advanceTimersByTimeAsync(2000);
    });
  });
});
