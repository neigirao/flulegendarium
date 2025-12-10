import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { saveGameHistory, getUserGameHistory, getUserStats, GameHistory } from '../gameHistoryService';
import { supabase } from '@/integrations/supabase/client';

describe('gameHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveGameHistory', () => {
    it('should save game history and return data', async () => {
      const mockHistory: Omit<GameHistory, 'id' | 'created_at'> = {
        user_id: 'user-123',
        score: 150,
        correct_guesses: 5,
        total_attempts: 8,
        game_duration: 180,
        current_streak: 3,
        max_streak: 5,
        game_mode: 'adaptive',
        difficulty_level: 'medio',
        difficulty_multiplier: 1.5,
      };

      const savedData = {
        ...mockHistory,
        id: 'history-123',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: savedData,
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await saveGameHistory(mockHistory);

      expect(result).toEqual(savedData);
      expect(mockFrom).toHaveBeenCalledWith('user_game_history');
    });

    it('should throw error on database error', async () => {
      const mockHistory: Omit<GameHistory, 'id' | 'created_at'> = {
        user_id: 'user-123',
        score: 100,
        correct_guesses: 4,
        total_attempts: 6,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(saveGameHistory(mockHistory)).rejects.toEqual({
        message: 'Insert failed',
      });
    });

    it('should throw on exception', async () => {
      const mockHistory: Omit<GameHistory, 'id' | 'created_at'> = {
        user_id: 'user-123',
        score: 50,
        correct_guesses: 2,
        total_attempts: 5,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(saveGameHistory(mockHistory)).rejects.toThrow('Network error');
    });
  });

  describe('getUserGameHistory', () => {
    it('should fetch user game history with default limit', async () => {
      const mockData = [
        { id: '1', user_id: 'user-123', score: 100, created_at: '2024-01-02' },
        { id: '2', user_id: 'user-123', score: 80, created_at: '2024-01-01' },
      ];

      const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserGameHistory('user-123');

      expect(result).toEqual(mockData);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should fetch with custom limit', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      await getUserGameHistory('user-123', 25);

      expect(mockLimit).toHaveBeenCalledWith(25);
    });

    it('should filter by game mode when provided', async () => {
      const mockEqGameMode = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockLimit = vi.fn().mockReturnValue({ eq: mockEqGameMode });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      await getUserGameHistory('user-123', 10, 'adaptive');

      expect(mockEqGameMode).toHaveBeenCalledWith('game_mode', 'adaptive');
    });

    it('should return empty array when no data', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserGameHistory('user-no-data');

      expect(result).toEqual([]);
    });

    it('should throw error on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Query failed' },
              }),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(getUserGameHistory('user-123')).rejects.toEqual({
        message: 'Query failed',
      });
    });

    it('should throw on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error('Connection lost')),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(getUserGameHistory('user-123')).rejects.toThrow('Connection lost');
    });
  });

  describe('getUserStats', () => {
    it('should calculate stats correctly from game data', async () => {
      const mockData = [
        { score: 100, correct_guesses: 5, total_attempts: 8, current_streak: 3, max_streak: 5, game_mode: 'adaptive', difficulty_level: 'medio' },
        { score: 80, correct_guesses: 4, total_attempts: 6, current_streak: 2, max_streak: 4, game_mode: 'classic', difficulty_level: null },
        { score: 120, correct_guesses: 6, total_attempts: 7, current_streak: 5, max_streak: 6, game_mode: 'adaptive', difficulty_level: 'dificil' },
      ];

      const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-123');

      expect(result.totalGames).toBe(3);
      expect(result.bestScore).toBe(120);
      expect(result.averageScore).toBe(100);
      expect(result.totalCorrectGuesses).toBe(15);
      expect(result.totalAttempts).toBe(21);
      expect(result.accuracyRate).toBeCloseTo(71.43, 1);
      expect(result.maxStreak).toBe(6);
      expect(result.adaptiveGames).toBe(2);
      expect(result.classicGames).toBe(1);
    });

    it('should return zero stats when no data', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-no-data');

      expect(result).toEqual({
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        totalCorrectGuesses: 0,
        totalAttempts: 0,
        accuracyRate: 0,
        maxStreak: 0,
        adaptiveGames: 0,
        classicGames: 0,
      });
    });

    it('should return zero stats when data is null', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-123');

      expect(result.totalGames).toBe(0);
    });

    it('should filter by game mode when provided', async () => {
      const mockData = [
        { score: 100, correct_guesses: 5, total_attempts: 8, max_streak: 5, game_mode: 'adaptive' },
      ];

      const mockEqGameMode = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = vi.fn().mockReturnValue({ eq: mockEqGameMode });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-123', 'adaptive');

      expect(mockEqGameMode).toHaveBeenCalledWith('game_mode', 'adaptive');
      expect(result.totalGames).toBe(1);
    });

    it('should handle games without max_streak', async () => {
      const mockData = [
        { score: 100, correct_guesses: 5, total_attempts: 8, max_streak: null, game_mode: 'classic' },
        { score: 80, correct_guesses: 4, total_attempts: 6, max_streak: 3, game_mode: 'classic' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-123');

      expect(result.maxStreak).toBe(3);
    });

    it('should calculate accuracy rate correctly with zero attempts', async () => {
      const mockData = [
        { score: 0, correct_guesses: 0, total_attempts: 0, max_streak: 0, game_mode: 'classic' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-123');

      expect(result.accuracyRate).toBe(0);
    });

    it('should throw error on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Stats query failed' },
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(getUserStats('user-123')).rejects.toEqual({
        message: 'Stats query failed',
      });
    });

    it('should throw on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Timeout')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      await expect(getUserStats('user-123')).rejects.toThrow('Timeout');
    });

    it('should count games with null game_mode as classic', async () => {
      const mockData = [
        { score: 100, correct_guesses: 5, total_attempts: 8, max_streak: 5, game_mode: null },
        { score: 80, correct_guesses: 4, total_attempts: 6, max_streak: 4, game_mode: undefined },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await getUserStats('user-123');

      expect(result.classicGames).toBe(2);
      expect(result.adaptiveGames).toBe(0);
    });
  });
});
