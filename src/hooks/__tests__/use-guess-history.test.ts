import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuessHistory } from '../use-guess-history';

describe('useGuessHistory', () => {
  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    expect(result.current.history).toEqual([]);
  });

  it('should add entry to history', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    act(() => {
      result.current.addEntry({
        playerName: 'Fred',
        guess: 'Romário',
        isCorrect: false,
      });
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].playerName).toBe('Fred');
    expect(result.current.history[0].guess).toBe('Romário');
    expect(result.current.history[0].isCorrect).toBe(false);
  });

  it('should auto-generate id and timestamp', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    act(() => {
      result.current.addEntry({
        playerName: 'Fred',
        guess: 'Fred',
        isCorrect: true,
      });
    });

    expect(result.current.history[0].id).toBeDefined();
    expect(result.current.history[0].id.length).toBeGreaterThan(0);
    expect(result.current.history[0].timestamp).toBeDefined();
    expect(typeof result.current.history[0].timestamp).toBe('number');
  });

  it('should add multiple entries in order', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    act(() => {
      result.current.addEntry({ playerName: 'Player1', guess: 'Guess1', isCorrect: true });
      result.current.addEntry({ playerName: 'Player2', guess: 'Guess2', isCorrect: false });
      result.current.addEntry({ playerName: 'Player3', guess: 'Guess3', isCorrect: true });
    });

    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[0].playerName).toBe('Player1');
    expect(result.current.history[1].playerName).toBe('Player2');
    expect(result.current.history[2].playerName).toBe('Player3');
  });

  it('should store optional fields', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    act(() => {
      result.current.addEntry({
        playerName: 'Fred',
        playerImageUrl: 'https://example.com/fred.jpg',
        guess: 'Fred',
        isCorrect: true,
        difficulty: 'facil',
        pointsEarned: 150,
        timeRemaining: 25,
      });
    });

    const entry = result.current.history[0];
    expect(entry.playerImageUrl).toBe('https://example.com/fred.jpg');
    expect(entry.difficulty).toBe('facil');
    expect(entry.pointsEarned).toBe(150);
    expect(entry.timeRemaining).toBe(25);
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    act(() => {
      result.current.addEntry({ playerName: 'Player1', guess: 'Guess1', isCorrect: true });
      result.current.addEntry({ playerName: 'Player2', guess: 'Guess2', isCorrect: false });
    });

    expect(result.current.history).toHaveLength(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });

  describe('getStats', () => {
    it('should return zero stats for empty history', () => {
      const { result } = renderHook(() => useGuessHistory());
      
      const stats = result.current.getStats();
      
      expect(stats.totalGuesses).toBe(0);
      expect(stats.correctGuesses).toBe(0);
      expect(stats.incorrectGuesses).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    it('should calculate correct stats', () => {
      const { result } = renderHook(() => useGuessHistory());
      
      act(() => {
        result.current.addEntry({ playerName: 'P1', guess: 'G1', isCorrect: true });
        result.current.addEntry({ playerName: 'P2', guess: 'G2', isCorrect: true });
        result.current.addEntry({ playerName: 'P3', guess: 'G3', isCorrect: false });
        result.current.addEntry({ playerName: 'P4', guess: 'G4', isCorrect: true });
      });

      const stats = result.current.getStats();
      
      expect(stats.totalGuesses).toBe(4);
      expect(stats.correctGuesses).toBe(3);
      expect(stats.incorrectGuesses).toBe(1);
      expect(stats.accuracy).toBe(75);
    });

    it('should calculate 100% accuracy when all correct', () => {
      const { result } = renderHook(() => useGuessHistory());
      
      act(() => {
        result.current.addEntry({ playerName: 'P1', guess: 'G1', isCorrect: true });
        result.current.addEntry({ playerName: 'P2', guess: 'G2', isCorrect: true });
      });

      const stats = result.current.getStats();
      expect(stats.accuracy).toBe(100);
    });

    it('should calculate 0% accuracy when all incorrect', () => {
      const { result } = renderHook(() => useGuessHistory());
      
      act(() => {
        result.current.addEntry({ playerName: 'P1', guess: 'G1', isCorrect: false });
        result.current.addEntry({ playerName: 'P2', guess: 'G2', isCorrect: false });
      });

      const stats = result.current.getStats();
      expect(stats.accuracy).toBe(0);
    });

    it('should reset stats after clearHistory', () => {
      const { result } = renderHook(() => useGuessHistory());
      
      act(() => {
        result.current.addEntry({ playerName: 'P1', guess: 'G1', isCorrect: true });
        result.current.addEntry({ playerName: 'P2', guess: 'G2', isCorrect: true });
      });

      expect(result.current.getStats().totalGuesses).toBe(2);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.getStats().totalGuesses).toBe(0);
    });
  });

  it('should generate unique ids for each entry', () => {
    const { result } = renderHook(() => useGuessHistory());
    
    act(() => {
      result.current.addEntry({ playerName: 'P1', guess: 'G1', isCorrect: true });
      result.current.addEntry({ playerName: 'P2', guess: 'G2', isCorrect: true });
      result.current.addEntry({ playerName: 'P3', guess: 'G3', isCorrect: true });
    });

    const ids = result.current.history.map(h => h.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(3);
  });
});
