import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerSessionHistory } from '../use-player-session-history';

const STORAGE_KEY = 'flu_recent_player_ids';

describe('usePlayerSessionHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts with empty history when localStorage is empty', () => {
    const { result } = renderHook(() => usePlayerSessionHistory());
    expect(result.current.getRecentIds().size).toBe(0);
  });

  it('loads existing history from localStorage on mount', () => {
    const stored = ['id-1', 'id-2', 'id-3'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => usePlayerSessionHistory());
    const ids = result.current.getRecentIds();

    expect(ids.size).toBe(3);
    expect(ids.has('id-1')).toBe(true);
    expect(ids.has('id-3')).toBe(true);
  });

  it('records a new player id and persists to localStorage', () => {
    const { result } = renderHook(() => usePlayerSessionHistory());

    act(() => {
      result.current.recordPlayer('player-abc');
    });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved).toContain('player-abc');
    expect(result.current.getRecentIds().has('player-abc')).toBe(true);
  });

  it('moves already-seen player to the end (most recent) when recorded again', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id-1', 'id-2']));
    const { result } = renderHook(() => usePlayerSessionHistory());

    act(() => {
      result.current.recordPlayer('id-1');
    });

    const saved: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved[saved.length - 1]).toBe('id-1');
    expect(saved.filter(id => id === 'id-1').length).toBe(1); // no duplicates
  });

  it('caps history at 30 entries', () => {
    const { result } = renderHook(() => usePlayerSessionHistory());

    act(() => {
      for (let i = 0; i < 35; i++) {
        result.current.recordPlayer(`player-${i}`);
      }
    });

    const saved: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.length).toBe(30);
    // Oldest entries dropped
    expect(saved.includes('player-0')).toBe(false);
    // Latest entries kept
    expect(saved.includes('player-34')).toBe(true);
  });

  it('clearHistory empties the set and removes localStorage key', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id-1', 'id-2']));
    const { result } = renderHook(() => usePlayerSessionHistory());

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.getRecentIds().size).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');

    // Should not throw
    const { result } = renderHook(() => usePlayerSessionHistory());
    expect(result.current.getRecentIds().size).toBe(0);
  });

  it('getRecentIds returns a snapshot (immutable from external perspective)', () => {
    const { result } = renderHook(() => usePlayerSessionHistory());

    act(() => {
      result.current.recordPlayer('player-x');
    });

    const snapshot1 = result.current.getRecentIds();

    act(() => {
      result.current.recordPlayer('player-y');
    });

    // snapshot1 was captured before player-y was added
    expect(snapshot1.has('player-y')).toBe(false);
  });
});
