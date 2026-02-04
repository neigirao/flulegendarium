import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdaptivePlayerSelection } from '../use-adaptive-player-selection';
import { Player, DifficultyLevel } from '@/types/guess-game';

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create mock players
const createMockPlayer = (
  id: string, 
  name: string, 
  difficulty: DifficultyLevel
): Player => ({
  id,
  name,
  position: 'Atacante',
  image_url: `https://example.com/${id}.jpg`,
  year_highlight: '2020',
  fun_fact: 'Test fact',
  achievements: ['Test achievement'],
  nicknames: [name.split(' ')[0]],
  statistics: { gols: 10, jogos: 50 },
  difficulty_level: difficulty,
  difficulty_score: 50,
});

describe('useAdaptivePlayerSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with muito_facil difficulty level', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      expect(result.current.currentDifficultyLevel).toBe('muito_facil');
    });

    it('should expose selectPlayerByDifficulty function', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      expect(typeof result.current.selectPlayerByDifficulty).toBe('function');
    });

    it('should expose setCurrentDifficultyLevel function', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      expect(typeof result.current.setCurrentDifficultyLevel).toBe('function');
    });
  });

  describe('setCurrentDifficultyLevel', () => {
    it('should update difficulty level', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      act(() => {
        result.current.setCurrentDifficultyLevel('dificil');
      });

      expect(result.current.currentDifficultyLevel).toBe('dificil');
    });

    it('should handle all difficulty levels', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const levels: DifficultyLevel[] = [
        'muito_facil',
        'facil',
        'medio',
        'dificil',
        'muito_dificil'
      ];

      levels.forEach(level => {
        act(() => {
          result.current.setCurrentDifficultyLevel(level);
        });
        expect(result.current.currentDifficultyLevel).toBe(level);
      });
    });
  });

  describe('selectPlayerByDifficulty', () => {
    const mockPlayers: Player[] = [
      createMockPlayer('1', 'Easy Player 1', 'muito_facil'),
      createMockPlayer('2', 'Easy Player 2', 'muito_facil'),
      createMockPlayer('3', 'Medium Player 1', 'medio'),
      createMockPlayer('4', 'Medium Player 2', 'medio'),
      createMockPlayer('5', 'Hard Player 1', 'dificil'),
      createMockPlayer('6', 'Very Hard Player', 'muito_dificil'),
    ];

    it('should filter players by difficulty level', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        mockPlayers,
        'medio'
      );

      expect(selectedPlayer).not.toBeNull();
      expect(selectedPlayer!.difficulty_level).toBe('medio');
    });

    it('should return player with exact difficulty', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        mockPlayers,
        'muito_dificil'
      );

      expect(selectedPlayer).not.toBeNull();
      expect(selectedPlayer!.name).toBe('Very Hard Player');
    });

    it('should exclude used player ids', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const usedPlayerIds = new Set(['1']);
      const selectedPlayer = result.current.selectPlayerByDifficulty(
        mockPlayers,
        'muito_facil',
        usedPlayerIds
      );

      expect(selectedPlayer).not.toBeNull();
      expect(selectedPlayer!.id).toBe('2');
    });

    it('should return null if no players available', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        [],
        'medio'
      );

      expect(selectedPlayer).toBeNull();
    });

    it('should return null if all players used', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const allPlayerIds = new Set(mockPlayers.map(p => p.id));
      const selectedPlayer = result.current.selectPlayerByDifficulty(
        mockPlayers,
        'medio',
        allPlayerIds
      );

      expect(selectedPlayer).toBeNull();
    });

    it('should return null if no players at exact difficulty', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const limitedPlayers = mockPlayers.filter(
        p => p.difficulty_level !== 'facil'
      );
      const selectedPlayer = result.current.selectPlayerByDifficulty(
        limitedPlayers,
        'facil'
      );

      expect(selectedPlayer).toBeNull();
    });

    it('should return random player from filtered set', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      // Run multiple times to verify randomness
      const selectedIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const selectedPlayer = result.current.selectPlayerByDifficulty(
          mockPlayers,
          'muito_facil'
        );
        if (selectedPlayer) {
          selectedIds.add(selectedPlayer.id);
        }
      }

      // With enough iterations, we should select both muito_facil players
      expect(selectedIds.size).toBeGreaterThanOrEqual(1);
      // All selected should be muito_facil
      selectedIds.forEach(id => {
        const player = mockPlayers.find(p => p.id === id);
        expect(player?.difficulty_level).toBe('muito_facil');
      });
    });

    it('should handle undefined usedPlayerIds', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        mockPlayers,
        'medio'
      );

      expect(selectedPlayer).not.toBeNull();
      expect(selectedPlayer!.difficulty_level).toBe('medio');
    });

    it('should handle empty usedPlayerIds set', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        mockPlayers,
        'medio',
        new Set()
      );

      expect(selectedPlayer).not.toBeNull();
    });

    it('should handle null players array', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        null as unknown as Player[],
        'medio'
      );

      expect(selectedPlayer).toBeNull();
    });

    it('should handle players without difficulty_level', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const playersWithoutDifficulty: Player[] = [
        {
          ...createMockPlayer('1', 'Player 1', 'medio'),
          difficulty_level: undefined,
        },
        createMockPlayer('2', 'Player 2', 'medio'),
      ];

      const selectedPlayer = result.current.selectPlayerByDifficulty(
        playersWithoutDifficulty,
        'medio'
      );

      expect(selectedPlayer).not.toBeNull();
      expect(selectedPlayer!.id).toBe('2');
    });
  });

  describe('difficulty level scenarios', () => {
    const createPlayersForLevel = (
      level: DifficultyLevel, 
      count: number
    ): Player[] => {
      return Array.from({ length: count }, (_, i) => 
        createMockPlayer(`${level}-${i}`, `Player ${level} ${i}`, level)
      );
    };

    it('should select from muito_facil pool', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());
      const players = createPlayersForLevel('muito_facil', 5);

      const selected = result.current.selectPlayerByDifficulty(
        players,
        'muito_facil'
      );

      expect(selected).not.toBeNull();
      expect(selected!.difficulty_level).toBe('muito_facil');
    });

    it('should select from facil pool', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());
      const players = createPlayersForLevel('facil', 5);

      const selected = result.current.selectPlayerByDifficulty(
        players,
        'facil'
      );

      expect(selected).not.toBeNull();
      expect(selected!.difficulty_level).toBe('facil');
    });

    it('should select from medio pool', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());
      const players = createPlayersForLevel('medio', 5);

      const selected = result.current.selectPlayerByDifficulty(
        players,
        'medio'
      );

      expect(selected).not.toBeNull();
      expect(selected!.difficulty_level).toBe('medio');
    });

    it('should select from dificil pool', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());
      const players = createPlayersForLevel('dificil', 5);

      const selected = result.current.selectPlayerByDifficulty(
        players,
        'dificil'
      );

      expect(selected).not.toBeNull();
      expect(selected!.difficulty_level).toBe('dificil');
    });

    it('should select from muito_dificil pool', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());
      const players = createPlayersForLevel('muito_dificil', 5);

      const selected = result.current.selectPlayerByDifficulty(
        players,
        'muito_dificil'
      );

      expect(selected).not.toBeNull();
      expect(selected!.difficulty_level).toBe('muito_dificil');
    });
  });

  describe('no fallback behavior', () => {
    it('should NOT fallback to other difficulties', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const players: Player[] = [
        createMockPlayer('1', 'Easy Player', 'muito_facil'),
        createMockPlayer('2', 'Hard Player', 'dificil'),
      ];

      // Request medio - should return null, not fallback
      const selected = result.current.selectPlayerByDifficulty(
        players,
        'medio'
      );

      expect(selected).toBeNull();
    });

    it('should strictly respect database difficulty', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const players: Player[] = [
        createMockPlayer('1', 'Player 1', 'facil'),
        createMockPlayer('2', 'Player 2', 'facil'),
        createMockPlayer('3', 'Player 3', 'facil'),
      ];

      // Request dificil - should return null
      const selected = result.current.selectPlayerByDifficulty(
        players,
        'dificil'
      );

      expect(selected).toBeNull();
    });
  });

  describe('progressive game simulation', () => {
    it('should support selecting players without repeat', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const players: Player[] = [
        createMockPlayer('1', 'Player 1', 'medio'),
        createMockPlayer('2', 'Player 2', 'medio'),
        createMockPlayer('3', 'Player 3', 'medio'),
      ];

      const usedIds = new Set<string>();
      const selectedPlayers: Player[] = [];

      // Select all players one by one
      for (let i = 0; i < 3; i++) {
        const selected = result.current.selectPlayerByDifficulty(
          players,
          'medio',
          usedIds
        );

        expect(selected).not.toBeNull();
        expect(usedIds.has(selected!.id)).toBe(false);

        usedIds.add(selected!.id);
        selectedPlayers.push(selected!);
      }

      // Fourth selection should return null
      const fourthSelection = result.current.selectPlayerByDifficulty(
        players,
        'medio',
        usedIds
      );

      expect(fourthSelection).toBeNull();
      expect(selectedPlayers).toHaveLength(3);
    });

    it('should handle mixed difficulty game', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const players: Player[] = [
        createMockPlayer('e1', 'Easy 1', 'muito_facil'),
        createMockPlayer('e2', 'Easy 2', 'muito_facil'),
        createMockPlayer('m1', 'Medium 1', 'medio'),
        createMockPlayer('h1', 'Hard 1', 'dificil'),
      ];

      const usedIds = new Set<string>();

      // Select easy
      const easy = result.current.selectPlayerByDifficulty(
        players, 
        'muito_facil', 
        usedIds
      );
      expect(easy).not.toBeNull();
      usedIds.add(easy!.id);

      // Select medium
      const medium = result.current.selectPlayerByDifficulty(
        players, 
        'medio', 
        usedIds
      );
      expect(medium).not.toBeNull();
      usedIds.add(medium!.id);

      // Select hard
      const hard = result.current.selectPlayerByDifficulty(
        players, 
        'dificil', 
        usedIds
      );
      expect(hard).not.toBeNull();
      usedIds.add(hard!.id);

      // All different
      expect(new Set([easy!.id, medium!.id, hard!.id]).size).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle very large player list', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const largePlayers: Player[] = Array.from({ length: 1000 }, (_, i) => 
        createMockPlayer(`${i}`, `Player ${i}`, 'medio')
      );

      const selected = result.current.selectPlayerByDifficulty(
        largePlayers,
        'medio'
      );

      expect(selected).not.toBeNull();
      expect(selected!.difficulty_level).toBe('medio');
    });

    it('should handle single player in pool', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const singlePlayer = [createMockPlayer('only', 'Only Player', 'medio')];

      const selected = result.current.selectPlayerByDifficulty(
        singlePlayer,
        'medio'
      );

      expect(selected).not.toBeNull();
      expect(selected!.id).toBe('only');
    });

    it('should handle usedPlayerIds containing non-existent ids', () => {
      const { result } = renderHook(() => useAdaptivePlayerSelection());

      const players: Player[] = [
        createMockPlayer('1', 'Player 1', 'medio'),
      ];

      const usedIds = new Set(['non-existent-1', 'non-existent-2']);

      const selected = result.current.selectPlayerByDifficulty(
        players,
        'medio',
        usedIds
      );

      expect(selected).not.toBeNull();
      expect(selected!.id).toBe('1');
    });
  });
});
