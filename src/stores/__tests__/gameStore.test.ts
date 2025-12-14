import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Clear modules to reset store between tests
beforeEach(() => {
  localStorageMock.clear();
  vi.resetModules();
});

describe('useGameStore', () => {
  it('should initialize with default values', async () => {
    const { useGameStore } = await import('../gameStore');
    const state = useGameStore.getState();
    
    expect(state.session.isActive).toBe(false);
    expect(state.session.score).toBe(0);
    expect(state.session.attempts).toBe(0);
    expect(state.session.correctGuesses).toBe(0);
    expect(state.isLoading).toBe(false);
  });

  it('should start a game with correct mode and difficulty', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive', 'hard');
    });

    const state = useGameStore.getState();
    expect(state.session.isActive).toBe(true);
    expect(state.session.mode).toBe('adaptive');
    expect(state.session.difficulty).toBe('hard');
    expect(state.session.startTime).toBeDefined();
    expect(state.session.score).toBe(0);
  });

  it('should use default difficulty when not provided', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('decade');
    });

    const state = useGameStore.getState();
    expect(state.session.difficulty).toBe('medium');
  });

  it('should update score correctly', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().updateScore(100);
    });

    expect(useGameStore.getState().session.score).toBe(100);

    act(() => {
      useGameStore.getState().updateScore(50);
    });

    expect(useGameStore.getState().session.score).toBe(150);
  });

  it('should record correct attempt', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
    });

    const state = useGameStore.getState();
    expect(state.session.attempts).toBe(1);
    expect(state.session.correctGuesses).toBe(1);
  });

  it('should record incorrect attempt', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(false);
    });

    const state = useGameStore.getState();
    expect(state.session.attempts).toBe(1);
    expect(state.session.correctGuesses).toBe(0);
  });

  it('should accumulate multiple attempts', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(false);
      useGameStore.getState().recordAttempt(true);
    });

    const state = useGameStore.getState();
    expect(state.session.attempts).toBe(4);
    expect(state.session.correctGuesses).toBe(3);
  });

  it('should end game and update stats', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().updateScore(200);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().endGame();
    });

    const state = useGameStore.getState();
    expect(state.session.isActive).toBe(false);
    expect(state.stats.totalGames).toBe(1);
    expect(state.stats.totalAttempts).toBe(2);
    expect(state.stats.bestScore).toBe(200);
  });

  it('should update best score only when higher', async () => {
    const { useGameStore } = await import('../gameStore');
    
    // First game - 100 points
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().updateScore(100);
      useGameStore.getState().endGame();
    });

    expect(useGameStore.getState().stats.bestScore).toBe(100);

    // Second game - 200 points (new best)
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().updateScore(200);
      useGameStore.getState().endGame();
    });

    expect(useGameStore.getState().stats.bestScore).toBe(200);

    // Third game - 150 points (not best)
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().updateScore(150);
      useGameStore.getState().endGame();
    });

    expect(useGameStore.getState().stats.bestScore).toBe(200);
  });

  it('should update stats with partial data', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().updateStats({ totalPlayers: 500 });
    });

    const state = useGameStore.getState();
    expect(state.stats.totalPlayers).toBe(500);
    expect(state.stats.totalGames).toBe(0); // unchanged
  });

  it('should set loading state', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().setLoading(true);
    });

    expect(useGameStore.getState().isLoading).toBe(true);

    act(() => {
      useGameStore.getState().setLoading(false);
    });

    expect(useGameStore.getState().isLoading).toBe(false);
  });

  it('should reset session to initial state', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('decade', 'hard');
      useGameStore.getState().updateScore(500);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().resetSession();
    });

    const state = useGameStore.getState();
    expect(state.session.isActive).toBe(false);
    expect(state.session.score).toBe(0);
    expect(state.session.attempts).toBe(0);
    expect(state.session.correctGuesses).toBe(0);
    expect(state.session.difficulty).toBe('medium');
    expect(state.session.mode).toBe('adaptive');
  });

  it('should calculate average accuracy correctly', async () => {
    const { useGameStore } = await import('../gameStore');
    
    // First game: 50% accuracy
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(false);
      useGameStore.getState().endGame();
    });

    expect(useGameStore.getState().stats.averageAccuracy).toBe(50);

    // Second game: 100% accuracy
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().endGame();
    });

    // Average of 50% and 100% = 75%
    expect(useGameStore.getState().stats.averageAccuracy).toBe(75);
  });

  it('should track streak when all answers are correct', async () => {
    const { useGameStore } = await import('../gameStore');
    
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().endGame();
    });

    const state = useGameStore.getState();
    expect(state.stats.currentStreak).toBe(1);
    expect(state.stats.longestStreak).toBe(0); // First game doesn't create longest yet
  });

  it('should reset current streak on imperfect game', async () => {
    const { useGameStore } = await import('../gameStore');
    
    // Perfect game
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().endGame();
    });

    expect(useGameStore.getState().stats.currentStreak).toBe(1);

    // Imperfect game
    act(() => {
      useGameStore.getState().startGame('adaptive');
      useGameStore.getState().recordAttempt(true);
      useGameStore.getState().recordAttempt(false);
      useGameStore.getState().endGame();
    });

    expect(useGameStore.getState().stats.currentStreak).toBe(0);
  });
});
