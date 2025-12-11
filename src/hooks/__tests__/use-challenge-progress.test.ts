import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChallengeProgress } from '../use-challenge-progress';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the dependencies
const mockUpdateProgressForMetric = vi.fn();
const mockChallenges = [
  { id: '1', title: 'Test Challenge', target_metric: 'correct_guesses' }
];

vi.mock('../use-daily-challenges-module', () => ({
  useDailyChallengesModule: () => ({
    updateProgressForMetric: mockUpdateProgressForMetric,
    challenges: mockChallenges,
  }),
}));

const mockUser = { id: 'test-user-id', email: 'test@test.com' };
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useChallengeProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProgressForMetric.mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should expose onCorrectGuess function', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.onCorrectGuess).toBe('function');
    });

    it('should expose onStreakAchieved function', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.onStreakAchieved).toBe('function');
    });

    it('should expose onGameCompleted function', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.onGameCompleted).toBe('function');
    });

    it('should expose onScoreThreshold function', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.onScoreThreshold).toBe('function');
    });

    it('should indicate hasActiveChallenges based on challenges', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasActiveChallenges).toBe(true);
    });
  });

  describe('onCorrectGuess', () => {
    it('should call updateProgressForMetric with correct_guesses', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onCorrectGuess();
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('correct_guesses', 1);
    });

    it('should handle errors gracefully', async () => {
      mockUpdateProgressForMetric.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      // Should not throw
      await act(async () => {
        await result.current.onCorrectGuess();
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalled();
    });
  });

  describe('onStreakAchieved', () => {
    it('should call updateProgressForMetric with max_streak', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onStreakAchieved(5);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('max_streak', 5);
    });

    it('should pass streak value correctly', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onStreakAchieved(10);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('max_streak', 10);
    });

    it('should handle errors gracefully', async () => {
      mockUpdateProgressForMetric.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onStreakAchieved(3);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalled();
    });
  });

  describe('onGameCompleted', () => {
    it('should call updateProgressForMetric for games_played', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onGameCompleted(100);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('games_played', 1);
    });

    it('should call updateProgressForMetric for total_score', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onGameCompleted(150);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('total_score', 150);
    });

    it('should update both metrics in one call', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onGameCompleted(200);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledTimes(2);
      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('games_played', 1);
      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('total_score', 200);
    });

    it('should handle errors gracefully', async () => {
      mockUpdateProgressForMetric.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onGameCompleted(100);
      });

      // Should still try both calls
      expect(mockUpdateProgressForMetric).toHaveBeenCalled();
    });
  });

  describe('onScoreThreshold', () => {
    it('should call updateProgressForMetric with score_threshold', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onScoreThreshold(100);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('score_threshold', 100);
    });

    it('should pass score value correctly', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onScoreThreshold(250);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('score_threshold', 250);
    });

    it('should handle errors gracefully', async () => {
      mockUpdateProgressForMetric.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onScoreThreshold(50);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalled();
    });
  });

  describe('without authenticated user', () => {
    beforeEach(() => {
      // Reset mock to return no user
      vi.doMock('../useAuth', () => ({
        useAuth: () => ({
          user: null,
        }),
      }));
    });

    it('should return hasActiveChallenges based on challenges array', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      // Still has challenges data, just can't update
      expect(result.current.hasActiveChallenges).toBe(true);
    });
  });

  describe('hasActiveChallenges', () => {
    it('should be true when challenges exist', () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasActiveChallenges).toBe(true);
    });
  });

  describe('callback memoization', () => {
    it('should maintain stable callback references', () => {
      const { result, rerender } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      const initialOnCorrectGuess = result.current.onCorrectGuess;
      const initialOnStreakAchieved = result.current.onStreakAchieved;
      const initialOnGameCompleted = result.current.onGameCompleted;
      const initialOnScoreThreshold = result.current.onScoreThreshold;

      rerender();

      // Callbacks should be memoized
      expect(result.current.onCorrectGuess).toBe(initialOnCorrectGuess);
      expect(result.current.onStreakAchieved).toBe(initialOnStreakAchieved);
      expect(result.current.onGameCompleted).toBe(initialOnGameCompleted);
      expect(result.current.onScoreThreshold).toBe(initialOnScoreThreshold);
    });
  });

  describe('multiple rapid calls', () => {
    it('should handle multiple onCorrectGuess calls', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await Promise.all([
          result.current.onCorrectGuess(),
          result.current.onCorrectGuess(),
          result.current.onCorrectGuess(),
        ]);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed metric updates', async () => {
      const { result } = renderHook(() => useChallengeProgress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await Promise.all([
          result.current.onCorrectGuess(),
          result.current.onStreakAchieved(5),
          result.current.onScoreThreshold(100),
        ]);
      });

      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('correct_guesses', 1);
      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('max_streak', 5);
      expect(mockUpdateProgressForMetric).toHaveBeenCalledWith('score_threshold', 100);
    });
  });
});

// Test without user
describe('useChallengeProgress without user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Override useAuth mock
    vi.doMock('../useAuth', () => ({
      useAuth: () => ({
        user: null,
      }),
    }));
  });

  // Note: This test is limited because we can't easily change mocks mid-suite
  // In a real scenario, we'd use different test files or setup/teardown patterns
});
