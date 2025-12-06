
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdaptiveGuessGame } from '../use-adaptive-guess-game';
import type { Player } from '@/types/guess-game';

// Simple waitFor helper
const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  callback();
};

// Mock dependencies
vi.mock('../use-adaptive-player-selection', () => ({
  useAdaptivePlayerSelection: () => ({
    selectPlayerByDifficulty: vi.fn((players, difficulty, usedIds) => {
      const available = players.filter((p: Player) => !usedIds.has(p.id));
      return available.length > 0 ? available[0] : null;
    }),
  }),
}));

vi.mock('../use-clean-timer', () => ({
  useCleanTimer: () => ({
    timeRemaining: 30,
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    isRunning: false,
  }),
}));

vi.mock('../use-adaptive-game-metrics', () => ({
  useAdaptiveGameMetrics: () => ({
    startMetricsTracking: vi.fn(),
    recordCorrectGuess: vi.fn(),
    recordIncorrectGuess: vi.fn(),
    saveGameData: vi.fn(),
    saveToRanking: vi.fn(),
    resetMetrics: vi.fn(),
    getCurrentStats: vi.fn(() => ({})),
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../use-tab-visibility', () => ({
  useTabVisibility: () => ({
    isVisible: true,
  }),
}));

vi.mock('@/utils/name-processor', () => ({
  processPlayerName: vi.fn(async (guess: string, correctName: string) => {
    const isMatch = guess.toLowerCase() === correctName.toLowerCase();
    return {
      processedName: isMatch ? correctName : null,
      confidence: isMatch ? 1.0 : 0.0,
    };
  }),
}));

const createMockPlayers = (): Player[] => [
  {
    id: '1',
    name: 'Fred',
    position: 'Atacante',
    image_url: 'https://example.com/fred.jpg',
    fun_fact: 'Artilheiro',
    achievements: ['Campeão'],
    year_highlight: '2012',
    statistics: { gols: 199, jogos: 382 },
    difficulty_level: 'facil',
    difficulty_score: 20,
  },
  {
    id: '2',
    name: 'Marcelo',
    position: 'Lateral',
    image_url: 'https://example.com/marcelo.jpg',
    fun_fact: 'Lateral esquerdo',
    achievements: ['Copa'],
    year_highlight: '2023',
    statistics: { gols: 10, jogos: 50 },
    difficulty_level: 'medio',
    difficulty_score: 50,
  },
  {
    id: '3',
    name: 'Deco',
    position: 'Meia',
    image_url: 'https://example.com/deco.jpg',
    fun_fact: 'Craque português',
    achievements: ['Libertadores'],
    year_highlight: '2008',
    statistics: { gols: 15, jogos: 40 },
    difficulty_level: 'dificil',
    difficulty_score: 80,
  },
];

describe('useAdaptiveGuessGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.score).toBe(0);
      expect(result.current.gameOver).toBe(false);
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.maxStreak).toBe(0);
      expect(result.current.currentDifficulty.level).toBe('very_easy');
    });

    it('should select a player on initialization', async () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      await waitFor(() => {
        expect(result.current.currentPlayer).not.toBeNull();
      });
    });

    it('should handle empty players array', () => {
      const { result } = renderHook(() => useAdaptiveGuessGame([]));

      expect(result.current.currentPlayer).toBeNull();
      expect(result.current.score).toBe(0);
    });
  });

  describe('Score Calculation', () => {
    it('should start with score of 0', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.score).toBe(0);
    });

    it('should apply difficulty multiplier to score', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      // Initial difficulty should be 'very_easy' with multiplier 1.0
      expect(result.current.currentDifficulty.multiplier).toBe(1.0);
    });
  });

  describe('Difficulty Progression', () => {
    it('should start at very_easy difficulty', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.currentDifficulty.level).toBe('very_easy');
      expect(result.current.currentDifficulty.label).toBe('Muito Fácil');
    });

    it('should have correct difficulty multipliers', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      // Verify starting multiplier
      expect(result.current.currentDifficulty.multiplier).toBeGreaterThan(0);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state when resetScore is called', async () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      // Wait for initial player selection
      await waitFor(() => {
        expect(result.current.currentPlayer).not.toBeNull();
      });

      // Reset the game
      act(() => {
        result.current.resetScore();
      });

      // Verify reset state
      expect(result.current.score).toBe(0);
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.maxStreak).toBe(0);
      expect(result.current.gameOver).toBe(false);
      expect(result.current.currentDifficulty.level).toBe('very_easy');
    });

    it('should clear used players on reset', async () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      await waitFor(() => {
        expect(result.current.currentPlayer).not.toBeNull();
      });

      act(() => {
        result.current.resetScore();
      });

      // After reset, a new player should be selectable
      await waitFor(() => {
        expect(result.current.currentPlayer).not.toBeNull();
      });
    });
  });

  describe('Game State Management', () => {
    it('should track isProcessingGuess state', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.isProcessingGuess).toBe(false);
    });

    it('should track hasLost state', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.hasLost).toBe(false);
    });

    it('should expose timer running state', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.isTimerRunning).toBe(false);
    });
  });

  describe('Player Selection', () => {
    it('should provide forceRefresh function', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(typeof result.current.forceRefresh).toBe('function');
    });

    it('should provide selectRandomPlayer function', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(typeof result.current.selectRandomPlayer).toBe('function');
    });
  });

  describe('Difficulty Change Info', () => {
    it('should start with no difficulty change info', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(result.current.difficultyChangeInfo).toBeNull();
    });

    it('should provide clearDifficultyChange function', () => {
      const players = createMockPlayers();
      const { result } = renderHook(() => useAdaptiveGuessGame(players));

      expect(typeof result.current.clearDifficultyChange).toBe('function');
    });
  });
});
